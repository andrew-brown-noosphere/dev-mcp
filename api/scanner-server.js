// Express server for the Playwright scanner with AI generation
const express = require('express');
const cors = require('cors');
const { ComprehensiveScanner } = require('./scanner-playwright');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || 'your-api-key-here'
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Scraper service is running' });
});

// AI-powered llms.txt generation
async function generateLLMsTxtWithAI(scrapedData) {
    const { marketing, technical, performance } = scrapedData;
    
    // Prepare context for AI
    const context = {
        title: marketing.title || 'Unknown Company',
        description: marketing.description || '',
        useCases: marketing.useCases || [],
        testimonials: marketing.testimonials || [],
        workshops: marketing.workshops || [],
        blogInsights: marketing.blog_insights || [],
        documentation: technical.documentation || '',
        endpoints: technical.api_endpoints || [],
        authentication: technical.authentication || [],
        sdks: technical.sdks || [],
        performanceMetrics: performance.metrics || [],
        differentiators: marketing.differentiators || []
    };
    
    const systemPrompt = `You are an expert at creating llms.txt files that help AI agents discover and integrate with APIs. 
Create a comprehensive llms.txt file that:
1. Clearly explains what the company/API does
2. Highlights key capabilities and use cases
3. Provides technical integration details
4. Includes performance metrics and differentiators
5. Makes it easy for AI agents to understand how to use the API
6. If applicable, includes MCP (Model Context Protocol) server configuration for direct AI integration

Format the output as a valid llms.txt file with proper sections and YAML-like syntax.
Include an MCP section if the service would benefit from direct AI tool integration.`;

    const userPrompt = `Based on the following information scraped from ${scrapedData.domain}, create a comprehensive llms.txt file:

Company: ${context.title}
Description: ${context.description}

Key Use Cases:
${context.useCases.map(uc => `- ${uc}`).join('\n')}

Customer Success:
${context.testimonials.map(t => `- ${t.company}: "${t.quote}" (${t.metric})`).join('\n')}

Technical Details:
- Documentation: ${context.documentation}
- Authentication: ${context.authentication.join(', ')}
- SDKs: ${context.sdks.join(', ')}
- API Endpoints: ${context.endpoints.slice(0, 5).join(', ')}

Performance & Differentiators:
${context.differentiators.join('\n')}

Blog Insights & Resources:
${context.blogInsights.slice(0, 5).map(b => `- ${b}`).join('\n')}

Workshops/Training:
${context.workshops.slice(0, 5).map(w => `- ${w}`).join('\n')}

Generate a comprehensive llms.txt file that will help AI agents understand and integrate with this API/service.`;

    try {
        const response = await anthropic.messages.create({
            model: "claude-3-sonnet-20241022",
            max_tokens: 2000,
            temperature: 0.3,
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: userPrompt
                }
            ]
        });
        
        return response.content[0].text;
    } catch (error) {
        console.error('AI generation error:', error);
        throw error;
    }
}

// Main scanning endpoint with AI generation
app.post('/api/scan', async (req, res) => {
    const { url, generateWithAI = true } = req.body;
    
    if (!url) {
        return res.status(400).json({ 
            success: false, 
            error: 'URL is required' 
        });
    }

    console.log(`Scraping request for: ${url}`);
    const scraper = new ComprehensiveScraper();
    
    try {
        // First, scrape the website
        const scrapedResult = await scraper.scrapeWebsite(url);
        
        if (!scrapedResult.success) {
            return res.json(scrapedResult);
        }
        
        // If AI generation is requested and we have an API key
        if (generateWithAI && process.env.ANTHROPIC_API_KEY) {
            try {
                console.log('Generating llms.txt with AI...');
                const aiGeneratedContent = await generateLLMsTxtWithAI(scrapedResult.data);
                
                // Add AI-generated content to the response
                scrapedResult.data.aiGeneratedLLMsTxt = aiGeneratedContent;
                scrapedResult.data.generatedWithAI = true;
                
            } catch (aiError) {
                console.error('AI generation failed, returning scraped data only:', aiError);
                scrapedResult.data.generatedWithAI = false;
                scrapedResult.data.aiError = aiError.message;
            }
        }
        
        res.json(scrapedResult);
        
    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Scanner service running on port ${PORT}`);
    console.log(`Test with: curl -X POST http://localhost:${PORT}/api/scan -H "Content-Type: application/json" -d '{"url":"https://scylladb.com"}'`);
});