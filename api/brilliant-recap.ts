import Anthropic from '@anthropic-ai/sdk';
import { Resend } from 'resend';

const anthropic = new Anthropic();
const resend = new Resend(process.env.RESEND_API_KEY);

interface SessionData {
  email: string;
  session_id: string;
  landing_page: string;
  referrer: string;
  utm_source?: string;
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
}

interface RecapContent {
  subject: string;
  greeting: string;
  summary: string;
  resources: Array<{ title: string; url: string; why: string }>;
  closing: string;
}

async function generateRecap(session: SessionData): Promise<RecapContent> {
  const pagesContext = session.pages_viewed
    .map(p => `- "${p.title || p.path}": ${p.time_on_page}s, scrolled ${Math.round(p.scroll_depth * 100)}%`)
    .join('\n');

  const clicksContext = session.clicks.length > 0
    ? session.clicks.slice(0, 10).map(c => `- Clicked: "${c.element_text}"`).join('\n')
    : 'No specific CTAs clicked';

  const prompt = `You are creating a personalized email recap for someone who just visited DevExp.ai, a site about AI-native developer experience, MCP (Model Context Protocol), llms.txt, and agentic distribution strategies.

THEIR VISIT:
- Came from: ${session.referrer || 'Direct visit'}
- Search term: ${session.utm_term || 'None'}
- Time on site: ${Math.round(session.total_time / 60)} minutes
- Landing page: ${session.landing_page}

PAGES THEY VIEWED:
${pagesContext}

WHAT THEY CLICKED:
${clicksContext}

Generate a personalized recap in JSON format:
{
  "subject": "A catchy, personalized subject line (not generic, reference what they looked at)",
  "greeting": "A warm, brief opening that acknowledges what they were exploring (1 sentence)",
  "summary": "2-3 sentences summarizing what they seemed most interested in and why it matters. Be specific to their journey, not generic.",
  "resources": [
    {
      "title": "Resource name",
      "url": "Full URL to the resource",
      "why": "One sentence on why this is relevant to their interests"
    }
  ],
  "closing": "A brief, friendly sign-off with a soft CTA (1-2 sentences)"
}

Include 2-4 relevant resources. These can be:
- Blog posts they didn't see but would find valuable
- External resources (MCP docs, llms.txt spec, etc.)
- Tools on the site (llms.txt generator, evaluator)

Make it feel personal and valuable, not salesy. They should feel like "wow, this is actually useful."

Return ONLY valid JSON, no markdown.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = response.content.find(block => block.type === 'text');
  if (!textBlock) throw new Error('No response from AI');

  try {
    return JSON.parse(textBlock.text);
  } catch {
    // Fallback if JSON parsing fails
    return {
      subject: "Your DevExp.ai Visit Recap",
      greeting: "Thanks for exploring DevExp.ai today!",
      summary: "You spent time learning about AI-native developer experience and distribution strategies.",
      resources: [
        { title: "MCP Protocol Explained", url: "https://devexp.ai/blog/mcp-protocol-explained-for-marketers.html", why: "A great overview of the Model Context Protocol" },
        { title: "llms.txt Generator", url: "https://devexp.ai/llms-generator.html", why: "Create your own AI-readable site documentation" }
      ],
      closing: "Feel free to reach out if you'd like to chat about implementing any of these strategies!"
    };
  }
}

function buildEmailHtml(recap: RecapContent, session: SessionData): string {
  const resourcesHtml = recap.resources
    .map(r => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #1a1a2e;">
          <a href="${r.url}" style="color: #f77f00; text-decoration: none; font-weight: 600; font-size: 16px;">${r.title}</a>
          <p style="margin: 8px 0 0 0; color: #a0a0b0; font-size: 14px;">${r.why}</p>
        </td>
      </tr>
    `)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #030712; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0a0a1a; border-radius: 12px; border: 1px solid #1a1a2e;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #1a1a2e;">
              <span style="color: #f77f00; font-size: 24px; font-weight: 700;">DevExp.ai</span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #ffffff; font-size: 18px; line-height: 1.6; margin: 0 0 24px 0;">
                ${recap.greeting}
              </p>

              <p style="color: #c0c0d0; font-size: 16px; line-height: 1.7; margin: 0 0 32px 0;">
                ${recap.summary}
              </p>

              <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">
                📚 Resources for you
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0">
                ${resourcesHtml}
              </table>

              <p style="color: #c0c0d0; font-size: 16px; line-height: 1.7; margin: 32px 0 0 0;">
                ${recap.closing}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #050510; border-radius: 0 0 12px 12px;">
              <p style="color: #606070; font-size: 12px; margin: 0; text-align: center;">
                You requested this recap from DevExp.ai · <a href="https://devexp.ai" style="color: #606070;">Visit site</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

async function notifySlack(email: string, recap: RecapContent, session: SessionData): Promise<void> {
  const webhookUrl = process.env.SLACK_VISITOR_WEBHOOK;
  if (!webhookUrl) return;

  const topPages = session.pages_viewed
    .sort((a, b) => b.time_on_page - a.time_on_page)
    .slice(0, 3)
    .map(p => `• ${p.title || p.path}`)
    .join('\n');

  const message = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎯 New Recap Request!',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${email}* just requested a personalized recap of their visit.`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Time on Site:*\n${Math.round(session.total_time / 60)} min`,
          },
          {
            type: 'mrkdwn',
            text: `*Source:*\n${session.utm_source || session.referrer || 'Direct'}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Pages Viewed:*\n${topPages}`,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Email subject: "${recap.subject}"`,
          },
        ],
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
    const session: SessionData = req.body;

    // Validate email
    if (!session.email || !session.email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    // Validate session data
    if (!session.pages_viewed?.length) {
      return res.status(400).json({ error: 'No session data' });
    }

    // Generate personalized recap
    const recap = await generateRecap(session);

    // Build email HTML
    const emailHtml = buildEmailHtml(recap, session);

    // Send email via Resend
    await resend.emails.send({
      from: 'DevExp.ai <recap@devexp.ai>',
      to: session.email,
      subject: recap.subject,
      html: emailHtml,
    });

    // Notify Slack
    await notifySlack(session.email, recap, session);

    return res.status(200).json({ success: true, message: 'Recap sent!' });
  } catch (error) {
    console.error('Brilliant recap error:', error);
    return res.status(500).json({ error: 'Failed to send recap' });
  }
}
