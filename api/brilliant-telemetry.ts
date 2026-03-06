import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

// Rate limiting
const reportedSessions = new Map<string, number>();
const REPORT_COOLDOWN_MS = 5 * 60 * 1000; // 5 min cooldown per session

interface VisitorSession {
  session_id: string;
  fingerprint: string;
  landing_page: string;
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  pages_viewed: Array<{
    path: string;
    title: string;
    time_on_page: number;
    scroll_depth: number;
  }>;
  clicks: Array<{
    element_text: string;
    page_path: string;
  }>;
  total_time: number;
  device: {
    user_agent: string;
    screen: string;
    language: string;
  };
  ip_info?: {
    city?: string;
    region?: string;
    country?: string;
    org?: string;
  };
}

async function getIpInfo(ip: string): Promise<VisitorSession['ip_info']> {
  // Skip for localhost/private IPs
  if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::1') {
    return { city: 'Local', country: 'Development' };
  }

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    if (res.ok) {
      const data = await res.json();
      return {
        city: data.city,
        region: data.region,
        country: data.country_name,
        org: data.org,
      };
    }
  } catch {
    // Ignore errors
  }
  return {};
}

async function generateReport(session: VisitorSession): Promise<string> {
  const pagesContext = session.pages_viewed
    .map(p => `- ${p.title || p.path}: ${p.time_on_page}s, scrolled ${Math.round(p.scroll_depth * 100)}%`)
    .join('\n');

  const clicksContext = session.clicks.length > 0
    ? session.clicks.slice(0, 10).map(c => `- Clicked: "${c.element_text}" on ${c.page_path}`).join('\n')
    : 'No significant clicks tracked';

  const locationContext = session.ip_info?.city
    ? `${session.ip_info.city}, ${session.ip_info.country}${session.ip_info.org ? ` (${session.ip_info.org})` : ''}`
    : 'Unknown location';

  const prompt = `Analyze this website visitor session and write a brief, insightful report (3-4 sentences max). Focus on: who they might be, what they were looking for, and their level of intent/interest.

VISITOR DATA:
- Location: ${locationContext}
- Referrer: ${session.referrer || 'Direct visit'}
- UTM Source: ${session.utm_source || 'None'}
- UTM Campaign: ${session.utm_campaign || 'None'}
- Search Term: ${session.utm_term || 'None'}
- Total time on site: ${Math.round(session.total_time / 60)} minutes
- Landing page: ${session.landing_page}

PAGES VIEWED:
${pagesContext}

INTERACTIONS:
${clicksContext}

Write a concise, actionable insight about this visitor. Be specific about what content interested them and what this might indicate about their intent. If it looks like a bot or irrelevant traffic, say so briefly.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = response.content.find(block => block.type === 'text');
  return textBlock ? textBlock.text : 'Unable to generate report.';
}

async function postToSlack(session: VisitorSession, report: string): Promise<void> {
  const webhookUrl = process.env.SLACK_VISITOR_WEBHOOK;
  if (!webhookUrl) {
    console.error('SLACK_VISITOR_WEBHOOK not configured');
    return;
  }

  const locationText = session.ip_info?.city
    ? `${session.ip_info.city}, ${session.ip_info.country}`
    : 'Unknown';

  const orgText = session.ip_info?.org
    ? `\n*Organization:* ${session.ip_info.org}`
    : '';

  const topPages = session.pages_viewed
    .sort((a, b) => b.time_on_page - a.time_on_page)
    .slice(0, 3)
    .map(p => `• ${p.title || p.path} (${p.time_on_page}s)`)
    .join('\n');

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '✨ Brilliant Visitor Insight',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: report,
        },
      },
      {
        type: 'divider',
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Location:*\n${locationText}`,
          },
          {
            type: 'mrkdwn',
            text: `*Time on Site:*\n${Math.round(session.total_time / 60)} min`,
          },
          {
            type: 'mrkdwn',
            text: `*Source:*\n${session.utm_source || session.referrer || 'Direct'}`,
          },
          {
            type: 'mrkdwn',
            text: `*Landing:*\n${session.landing_page}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Top Pages:*\n${topPages}${orgText}`,
        },
      },
    ],
  };

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
}

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session: VisitorSession = req.body;

    // Basic validation
    if (!session.session_id || !session.pages_viewed?.length) {
      return res.status(400).json({ error: 'Invalid session data' });
    }

    // Skip very short sessions (likely bots or bounces)
    if (session.total_time < 10) {
      return res.status(200).json({ skipped: 'Session too short' });
    }

    // Rate limit: don't report same session multiple times
    const lastReport = reportedSessions.get(session.session_id);
    if (lastReport && Date.now() - lastReport < REPORT_COOLDOWN_MS) {
      return res.status(200).json({ skipped: 'Already reported' });
    }
    reportedSessions.set(session.session_id, Date.now());

    // Clean up old entries
    if (reportedSessions.size > 1000) {
      const cutoff = Date.now() - REPORT_COOLDOWN_MS;
      for (const [key, time] of reportedSessions.entries()) {
        if (time < cutoff) reportedSessions.delete(key);
      }
    }

    // Get IP info
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || '';
    session.ip_info = await getIpInfo(ip);

    // Generate AI report
    const report = await generateReport(session);

    // Post to Slack
    await postToSlack(session, report);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Brilliant telemetry error:', error);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
}
