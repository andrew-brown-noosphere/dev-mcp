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
            const text = match[1].trim().replace(/<[^>]*>/g, ''); // Remove nested HTML
            if (text.length > 50 && text.length < 500) {
                paragraphs.push(text);
                if (paragraphs.length >= 10) break; // Get more content
            }
        }
        
        // Extract headings for better content structure
        const headings = [];
        const headingMatches = html.matchAll(/<h[2-4][^>]*>([^<]+)<\/h[2-4]>/gi);
        for (const match of headingMatches) {
            const text = match[1].trim();
            if (text.length > 5) {
                headings.push(text);
                if (headings.length >= 10) break;
            }
        }
        
        // Extract links for finding docs, pricing, etc.
        const links = [];
        const linkMatches = html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi);
        for (const match of linkMatches) {
            const href = match[1];
            const text = match[2].trim();
            if (text && (text.toLowerCase().includes('doc') || 
                        text.toLowerCase().includes('api') || 
                        text.toLowerCase().includes('pricing') || 
                        text.toLowerCase().includes('testimonial') ||
                        text.toLowerCase().includes('customer') ||
                        text.toLowerCase().includes('case study'))) {
                links.push({ href, text });
            }
        }
        
        return {
            url,
            title: titleMatch ? titleMatch[1].trim() : '',
            description: descMatch ? descMatch[1].trim() : '',
            headline: h1Match ? h1Match[1].trim() : '',
            paragraphs,
            headings,
            links,
            htmlLength: html.length
        };
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

async function generateLLMsTxtFromHTML(pageData) {
    const systemPrompt = `You are an expert at creating llms.txt files following the official specification from llmstxt.org.

Create an llms.txt file with this structure:
1. H1 header with the company/project name (REQUIRED)
2. Blockquote summary describing what the company/product does
3. A few paragraphs explaining key capabilities and use cases
4. Relevant sections with H2 headers containing lists of important links

Sections to include if relevant information is found:
- ## Documentation (links to docs, API references, guides)
- ## Products & Services (key offerings with descriptions)  
- ## Use Cases (specific examples of how customers use the product)
- ## Customer Success (testimonials, case studies, notable customers)
- ## Key Differentiators (what makes this unique/special)
- ## Resources (blog, tutorials, community)
- ## Technical Details (APIs, SDKs, integrations)

Keep it concise and follow markdown format. Focus on what would be most useful for AI agents trying to understand and work with this service.`;
    
    const userPrompt = `Create an llms.txt file based on this website scan:

URL: ${pageData.url}
Title: ${pageData.title}
Description: ${pageData.description}
Main Headline: ${pageData.headline}

Section Headings found:
${pageData.headings.map(h => `- ${h}`).join('\n')}

Key content from the website:
${pageData.paragraphs.map((p, i) => `${i + 1}. ${p}`).join('\n\n')}

Important links found:
${pageData.links.map(l => `- ${l.text}: ${l.href}`).join('\n')}

Create a properly formatted llms.txt following the official spec. Use markdown format with # for the main header, > for the summary blockquote, ## for section headers, and - for list items.`;

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-haiku-20240307", // Use stable model
            max_tokens: 4000, // Increased for comprehensive output
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