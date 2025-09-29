// Simplified scanner for Vercel serverless - no Playwright needed
const Anthropic = require('@anthropic-ai/sdk').default;

// Initialize Anthropic
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

async function fetchPageContent(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; DevMCP.ai Scanner/1.0)'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const html = await response.text();
        
        // Extract basic info from HTML
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
        const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        
        // Extract more content
        const paragraphs = [];
        const paragraphMatches = html.matchAll(/<p[^>]*>([^<]+)<\/p>/gi);
        for (const match of paragraphMatches) {
            const text = match[1].trim();
            if (text.length > 50 && text.length < 500) {
                paragraphs.push(text);
                if (paragraphs.length >= 5) break;
            }
        }
        
        return {
            url,
            title: titleMatch ? titleMatch[1].trim() : '',
            description: descMatch ? descMatch[1].trim() : '',
            headline: h1Match ? h1Match[1].trim() : '',
            paragraphs,
            htmlLength: html.length
        };
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

async function generateLLMsTxtFromHTML(pageData) {
    const systemPrompt = `You are an expert at creating llms.txt files. Based on the website content provided, create a comprehensive and useful llms.txt file.

Focus on:
1. Using the actual company name and description from their website
2. Extracting their real value propositions and services
3. Identifying their API endpoints and technical capabilities
4. Including their actual marketing messaging
5. Being accurate to what they actually offer

Format as valid YAML for llms.txt.`;
    
    const userPrompt = `Create an llms.txt file based on this website scan:

URL: ${pageData.url}
Title: ${pageData.title}
Description: ${pageData.description}
Main Headline: ${pageData.headline}

Key content from their website:
${pageData.paragraphs.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Create a comprehensive llms.txt that accurately represents this company's actual offerings and capabilities.`;

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-haiku-20240307", // Use stable model
            max_tokens: 2000,
            temperature: 0.3,
            system: systemPrompt,
            messages: [{
                role: "user",
                content: userPrompt
            }]
        });
        
        return response.content[0].text;
    } catch (error) {
        console.error('AI generation error:', error);
        throw error;
    }
}

module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ 
            success: false, 
            error: 'URL is required' 
        });
    }
    
    // Check for API key
    if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ 
            success: false, 
            error: 'Scanner API not configured. Please add ANTHROPIC_API_KEY to environment variables.' 
        });
    }
    
    try {
        // Normalize URL
        let targetUrl = url;
        if (!targetUrl.startsWith('http')) {
            targetUrl = 'https://' + targetUrl;
        }
        
        // Fetch basic page content
        const pageData = await fetchPageContent(targetUrl);
        
        // Generate llms.txt with AI
        const aiGeneratedContent = await generateLLMsTxtFromHTML(pageData);
        
        // Return data structure compatible with frontend
        res.status(200).json({
            success: true,
            data: {
                marketing: {
                    found: true,
                    title: pageData.title,
                    description: pageData.description,
                    value_propositions: [pageData.headline].filter(Boolean),
                    useCases: pageData.paragraphs.slice(0, 3),
                    differentiators: [],
                    blog_insights: [],
                    testimonials: [],
                    workshops: [],
                    case_studies: []
                },
                technical: {
                    found: false,
                    documentation: `https://docs.${new URL(targetUrl).hostname}`,
                    api_endpoints: [],
                    authentication: [],
                    sdks: [],
                    code_examples: [],
                    getting_started: ''
                },
                performance: {
                    metrics: [],
                    benchmarks: []
                }
            },
            aiGeneratedLLMsTxt: aiGeneratedContent
        });
        
    } catch (error) {
        console.error('Scan error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};