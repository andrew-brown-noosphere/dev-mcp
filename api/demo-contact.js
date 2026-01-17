module.exports = async function handler(req, res) {
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
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { name, email, subject, message, company = '' } = body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: 'Email service is not configured.' });
    }

    const fromEmail = process.env.DEMO_FROM_EMAIL || 'DevMCP Demo <noreply@devmcp.ai>';
    const toEmail = process.env.DEMO_TO_EMAIL || 'andrew@noosphere.tech';

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        reply_to: email,
        subject: `New Demo Request: ${subject}`,
        html: `
          <h2>New Demo Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ''}
          <p><strong>Topic:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${String(message || '').replace(/\n/g, '<br>')}</p>
          <hr>
          <p><small>Submitted at: ${new Date().toLocaleString()}</small></p>
        `,
        text: `New Demo Request\n\nName: ${name}\nEmail: ${email}${company ? `\nCompany: ${company}` : ''}\nTopic: ${subject}\n\nMessage:\n${message}\n\nSubmitted at: ${new Date().toLocaleString()}`,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      let errorMessage = errorText;
      try {
        const parsed = JSON.parse(errorText);
        errorMessage = parsed.message || parsed.error || errorText;
      } catch (_) {
        // ignore parse error
      }
      console.error('Resend API error:', emailResponse.status, errorMessage);
      return res.status(500).json({ error: `Email failed: ${errorMessage}` });
    }

    let aiResponse = '';
    if (process.env.OPENAI_API_KEY) {
      try {
        const aiResult = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an AI assistant for DevMCP.ai. DevMCP provides enterprise MCP (Model Context Protocol) infrastructure - helping companies track AI agent adoption, manage MCP servers, and understand how AI tools interact with their APIs.

Generate a personalized response for the user who just submitted a demo request. Analyze:
1. Their email domain (corporate = enterprise needs, .edu = research interest, gmail/personal = individual developer)
2. Keywords in their message (AI agents, MCP, APIs, documentation, observability, etc.)
3. Their company context if provided

Be warm, insightful, and specific. Show you understand their context. Keep it to 2-3 sentences.
End by mentioning the team will follow up shortly with tailored information.`
              },
              {
                role: 'user',
                content: `Generate a personalized confirmation response for this demo request:

Name: ${name}
Email: ${email}
Email domain: ${email.split('@')[1]}
Company: ${company || 'Not provided'}
Topic: ${subject}
Message: ${message}

Craft a response that shows we understand their specific needs and what DevMCP can do for them.`
              },
            ],
            temperature: 0.7,
            max_tokens: 150,
          }),
        });

        if (aiResult.ok) {
          const json = await aiResult.json();
          aiResponse = json.choices?.[0]?.message?.content || '';
        } else {
          const errText = await aiResult.text();
          console.error('OpenAI API error:', aiResult.status, errText);
        }
      } catch (err) {
        console.error('AI response generation failed:', err);
      }
    }

    // Fallback response if AI generation fails
    if (!aiResponse) {
      const domain = email.split('@')[1];
      const isEnterprise = !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'].includes(domain);
      const interest = message.toLowerCase().includes('agent') ? 'AI agent observability' :
                       message.toLowerCase().includes('api') ? 'API intelligence' :
                       message.toLowerCase().includes('mcp') ? 'MCP infrastructure' :
                       'enterprise AI tooling';
      aiResponse = `Thanks ${name}! Based on your message, it sounds like you're exploring ${interest}${isEnterprise && company ? ` for ${company}` : ''}. We'll prepare a demo focused on your specific use case. The team will reach out shortly with next steps.`;
    }

    return res.status(200).json({
      success: true,
      message: 'Thanks! We will reach out shortly.',
      aiResponse,
    });
  } catch (error) {
    console.error('Demo form error:', error);
    return res.status(500).json({ error: 'Failed to submit your request. Please try again.' });
  }
};
