// Vercel serverless function for website scanning
const { ComprehensiveScanner } = require('./scanner-playwright');
const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// AI-powered llms.txt generation
async function generateLLMsTxtWithAI(scannedData) {
    const { marketing, technical, performance } = scannedData;
    
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

Use ONLY the information provided. Do not make up or assume any details.
Format the output as a valid YAML-style llms.txt file.`;
    
    const userPrompt = `Create an llms.txt file for this company based on the following scraped data:

Title: ${context.title}
Description: ${context.description}

Use Cases: ${JSON.stringify(context.useCases, null, 2)}
Testimonials: ${JSON.stringify(context.testimonials, null, 2)}
Blog Insights: ${JSON.stringify(context.blogInsights, null, 2)}
Documentation: ${context.documentation}
API Endpoints: ${JSON.stringify(context.endpoints, null, 2)}
SDKs: ${JSON.stringify(context.sdks, null, 2)}
Performance: ${JSON.stringify(context.performanceMetrics, null, 2)}
Differentiators: ${JSON.stringify(context.differentiators, null, 2)}`;

    try {
        const response = await anthropic.messages.create({
            model: process.env.ANTHROPIC_MODEL || "claude-3-sonnet-20241022",
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

module.exports = async (req, res) => {
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
    
    const { url, generateWithAI = true } = req.body;
    
    if (!url) {
        return res.status(400).json({ 
            success: false, 
            error: 'URL is required' 
        });
    }
    
    try {
        const scanner = new ComprehensiveScanner();
        const scannedData = await scanner.scanWebsite(url);
        
        if (!scannedData.success) {
            return res.status(500).json({
                success: false,
                error: scannedData.error
            });
        }
        
        // Generate llms.txt with AI
        const aiGeneratedContent = await generateLLMsTxtWithAI(scannedData.data);
        
        res.status(200).json({
            success: true,
            data: scannedData.data,
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