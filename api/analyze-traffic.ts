import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!supabase || !anthropic) {
    return res.status(503).json({ error: 'Service not configured' });
  }

  try {
    const { org_id = 'devmcp', days = 7 } = req.query;
    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000).toISOString();

    // Fetch all telemetry data
    const [visitorsRes, sessionsRes, eventsRes] = await Promise.all([
      supabase
        .from('site_visitors')
        .select('*')
        .eq('org_id', org_id)
        .gte('last_seen', since)
        .order('last_seen', { ascending: false })
        .limit(100),
      supabase
        .from('site_sessions')
        .select('*')
        .eq('org_id', org_id)
        .gte('started_at', since)
        .order('started_at', { ascending: false })
        .limit(200),
      supabase
        .from('site_events')
        .select('*')
        .eq('org_id', org_id)
        .gte('timestamp', since)
        .order('timestamp', { ascending: false })
        .limit(500),
    ]);

    const visitors = visitorsRes.data || [];
    const sessions = sessionsRes.data || [];
    const events = eventsRes.data || [];

    // Aggregate stats
    const stats = {
      period: `Last ${days} days`,
      visitors: {
        total: visitors.length,
        by_device: countBy(visitors, 'device_type'),
        by_browser: countBy(visitors, 'browser'),
        by_os: countBy(visitors, 'os'),
        by_country: countBy(visitors, 'geo_country'),
        by_city: countBy(visitors, 'geo_city'),
        returning: visitors.filter(v => v.session_count > 1).length,
      },
      sessions: {
        total: sessions.length,
        by_utm_source: countBy(sessions.filter(s => s.utm_source), 'utm_source'),
        by_utm_medium: countBy(sessions.filter(s => s.utm_medium), 'utm_medium'),
        by_landing_page: countBy(sessions, 'landing_page'),
        by_referrer: countByDomain(sessions),
        avg_page_views: avg(sessions, 'page_view_count'),
        with_assistant: sessions.filter(s => s.assistant_interactions > 0).length,
      },
      events: {
        total: events.length,
        by_type: countBy(events, 'event_type'),
        by_category: countBy(events, 'event_category'),
        top_pages: countBy(events.filter(e => e.event_type === 'page_view'), 'page_path'),
        clicks: events.filter(e => e.event_type === 'click').map(e => ({
          text: e.element_text?.slice(0, 50),
          page: e.page_path,
          count: 1
        })),
        scroll_depth: {
          reached_25: events.filter(e => e.event_name === 'scroll_25').length,
          reached_50: events.filter(e => e.event_name === 'scroll_50').length,
          reached_75: events.filter(e => e.event_name === 'scroll_75').length,
          reached_100: events.filter(e => e.event_name === 'scroll_100').length,
        },
        errors: events.filter(e => e.event_type === 'error').length,
        exit_intents: events.filter(e => e.event_name === 'exit_intent').length,
        form_submits: events.filter(e => e.event_name === 'form_submit').length,
        copy_events: events.filter(e => e.event_name === 'copy_text').length,
      },
      engagement: {
        assistant_conversations: events.filter(e => e.event_type === 'assistant_message').map(e => ({
          question: e.assistant_message?.slice(0, 200),
          page: e.page_path,
          persona: e.properties?.persona,
        })),
      },
      raw_sample: {
        recent_visitors: visitors.slice(0, 5).map(v => ({
          ip: v.ip_address,
          location: v.geo_city ? `${v.geo_city}, ${v.geo_country}` : 'Unknown',
          device: `${v.device_type}/${v.browser}/${v.os}`,
          sessions: v.session_count,
          pages: v.page_view_count,
        })),
        recent_sessions: sessions.slice(0, 10).map(s => ({
          landing: s.landing_page,
          referrer: s.referrer,
          utm_source: s.utm_source,
          pages: s.page_view_count,
          assistant_chats: s.assistant_interactions,
        })),
      }
    };

    // Send to Claude for analysis
    const prompt = `You are a web analytics expert. Analyze this website traffic data and provide actionable insights.

DATA:
${JSON.stringify(stats, null, 2)}

Provide a concise analysis covering:

1. **Traffic Overview** - Key numbers and trends
2. **Acquisition** - Where visitors are coming from (UTM sources, referrers, geo)
3. **Engagement** - How visitors interact (scroll depth, time on page, clicks)
4. **Content Performance** - Which pages perform best
5. **Conversion Signals** - Form submissions, AI assistant usage, exit intent patterns
6. **Recommendations** - 3-5 specific actionable improvements

Keep it brief and actionable. Use bullet points. Focus on what matters.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const analysis = response.content[0].type === 'text' ? response.content[0].text : '';

    return res.status(200).json({
      success: true,
      period: `Last ${days} days`,
      stats,
      analysis,
      generated_at: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
}

// Helper functions
function countBy(arr: any[], key: string): Record<string, number> {
  const counts: Record<string, number> = {};
  arr.forEach(item => {
    const val = item[key] || 'unknown';
    counts[val] = (counts[val] || 0) + 1;
  });
  // Sort by count descending
  return Object.fromEntries(
    Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
  );
}

function countByDomain(sessions: any[]): Record<string, number> {
  const counts: Record<string, number> = {};
  sessions.forEach(s => {
    if (s.referrer) {
      try {
        const domain = new URL(s.referrer).hostname;
        counts[domain] = (counts[domain] || 0) + 1;
      } catch {}
    } else {
      counts['direct'] = (counts['direct'] || 0) + 1;
    }
  });
  return Object.fromEntries(
    Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
  );
}

function avg(arr: any[], key: string): number {
  if (!arr.length) return 0;
  const sum = arr.reduce((acc, item) => acc + (item[key] || 0), 0);
  return Math.round((sum / arr.length) * 10) / 10;
}
