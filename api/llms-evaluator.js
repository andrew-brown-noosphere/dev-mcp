// Simple backend proxy for llms.txt evaluator
// This is a client-side simulation of the backend API

async function handleEvaluatorAPI(request) {
    const { url, domain, generatedContent } = request;
    
    // Normalize domain
    let normalizedDomain = domain;
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        normalizedDomain = 'https://' + domain;
    }
    
    const urlObj = new URL(normalizedDomain);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    
    // For demo purposes, return simulated results based on domain
    const timestamp = new Date().toISOString();
    
    // If we have generated content, analyze it directly
    if (generatedContent) {
        return analyzeGeneratedContent(generatedContent, baseUrl, urlObj.hostname, timestamp);
    }
    
    // Check if it's a known demo domain
    const knownDomains = ['anthropic.com', 'openai.com', 'stripe.com', 'github.com'];
    const isKnownDomain = knownDomains.some(known => domain.includes(known));
    
    if (isKnownDomain) {
        // Return good scores for known domains
        return {
            url: baseUrl,
            domain: urlObj.hostname,
            timestamp,
            overallScore: 75 + Math.floor(Math.random() * 20),
            llmsTxtFound: true,
            llmsTxtLocation: `${baseUrl}/llms.txt`,
            scores: {
                clarity: 70 + Math.floor(Math.random() * 20),
                completeness: 65 + Math.floor(Math.random() * 25),
                aiReadability: 75 + Math.floor(Math.random() * 20),
                examples: 60 + Math.floor(Math.random() * 30),
                authentication: 70 + Math.floor(Math.random() * 25),
                endpoints: 65 + Math.floor(Math.random() * 30)
            },
            details: {
                sections: {
                    authentication: true,
                    endpoints: true,
                    examples: Math.random() > 0.3,
                    rate_limits: Math.random() > 0.4,
                    error_handling: Math.random() > 0.5
                },
                aiCompatibility: {
                    claude: 0.7 + Math.random() * 0.25,
                    gpt4: 0.65 + Math.random() * 0.3,
                    general: 0.6 + Math.random() * 0.35
                }
            },
            recommendations: generateRecommendations()
        };
    } else {
        // Return "not found" for unknown domains
        return {
            url: baseUrl,
            domain: urlObj.hostname,
            timestamp,
            overallScore: 0,
            llmsTxtFound: false,
            scores: {
                clarity: 0,
                completeness: 0,
                aiReadability: 0,
                examples: 0,
                authentication: 0,
                endpoints: 0
            },
            details: {
                sections: {
                    authentication: false,
                    endpoints: false,
                    examples: false,
                    rate_limits: false,
                    error_handling: false
                },
                aiCompatibility: {
                    claude: 0,
                    gpt4: 0,
                    general: 0
                }
            },
            recommendations: [
                {
                    priority: 'high',
                    category: 'Documentation',
                    title: 'Create llms.txt file',
                    description: 'Add an llms.txt file to make your API discoverable by AI agents. Place it at /llms.txt or /.well-known/llms.txt'
                },
                {
                    priority: 'high',
                    category: 'AI Integration',
                    title: 'Define API instructions for AI',
                    description: 'Include clear instructions on how AI agents should use your API, including authentication, endpoints, and examples'
                }
            ]
        };
    }
}

function generateRecommendations() {
    const allRecommendations = [
        {
            priority: 'high',
            category: 'Examples',
            title: 'Add more code examples',
            description: 'Include comprehensive curl examples and code snippets for each endpoint to help AI agents learn usage patterns'
        },
        {
            priority: 'medium',
            category: 'Documentation',
            title: 'Improve error handling docs',
            description: 'Add clear documentation about error responses, status codes, and how to handle different error scenarios'
        },
        {
            priority: 'medium',
            category: 'Technical',
            title: 'Document rate limits',
            description: 'Clearly specify rate limits and throttling policies so AI agents can respect your API limits'
        },
        {
            priority: 'low',
            category: 'Standards',
            title: 'Add OpenAPI specification',
            description: 'Provide an OpenAPI (Swagger) specification to make your API more machine-readable'
        }
    ];
    
    // Return 2-3 random recommendations
    const count = 2 + Math.floor(Math.random() * 2);
    return allRecommendations.sort(() => Math.random() - 0.5).slice(0, count);
}

// Analyze generated llms.txt content
function analyzeGeneratedContent(content, baseUrl, hostname, timestamp) {
    // Parse the generated content
    const lines = content.split('\n');
    const sections = {
        title: false,
        description: false,
        capabilities: false,
        authentication: false,
        endpoints: false,
        examples: false,
        performance: false,
        testimonials: false,
        workshops: false
    };
    
    // Check which sections exist
    lines.forEach(line => {
        const lower = line.toLowerCase();
        if (lower.includes('title:')) sections.title = true;
        if (lower.includes('description:')) sections.description = true;
        if (lower.includes('capabilities:')) sections.capabilities = true;
        if (lower.includes('auth:') || lower.includes('authentication:')) sections.authentication = true;
        if (lower.includes('endpoints:') || lower.includes('api_endpoint:')) sections.endpoints = true;
        if (lower.includes('examples:') || lower.includes('quickstart:')) sections.examples = true;
        if (lower.includes('performance:')) sections.performance = true;
        if (lower.includes('testimonials:')) sections.testimonials = true;
        if (lower.includes('workshops:')) sections.workshops = true;
    });
    
    // Count code examples
    const codeExamples = (content.match(/```/g) || []).length / 2;
    
    // Calculate scores based on content
    const scores = {
        clarity: calculateClarityScore(content, sections),
        completeness: calculateCompletenessScore(sections),
        aiReadability: calculateAIReadabilityScore(content, sections),
        examples: Math.min(90, 50 + (codeExamples * 10)),
        authentication: sections.authentication ? 85 : 40,
        endpoints: sections.endpoints ? 80 : 35
    };
    
    const overallScore = Math.round(
        Object.values(scores).reduce((a, b) => a + b) / Object.keys(scores).length
    );
    
    return {
        url: baseUrl,
        domain: hostname,
        timestamp,
        overallScore,
        llmsTxtFound: true,
        llmsTxtLocation: 'Generated Content',
        generatedContent: true,
        scores,
        details: {
            sections: {
                authentication: sections.authentication,
                endpoints: sections.endpoints,
                examples: sections.examples || codeExamples > 0,
                rate_limits: content.includes('rate') || content.includes('limit'),
                error_handling: content.includes('error') || content.includes('status code'),
                performance: sections.performance,
                testimonials: sections.testimonials,
                workshops: sections.workshops
            },
            aiCompatibility: {
                claude: 0.85 + (sections.examples ? 0.1 : 0),
                gpt4: 0.80 + (sections.examples ? 0.15 : 0),
                general: 0.75 + (sections.authentication ? 0.1 : 0)
            }
        },
        recommendations: generateSmartRecommendations(sections, content)
    };
}

function calculateClarityScore(content, sections) {
    let score = 60;
    if (sections.title) score += 10;
    if (sections.description) score += 10;
    if (content.length > 500) score += 5;
    if (content.includes('# ')) score += 5; // Has headers
    if (sections.capabilities) score += 10;
    return Math.min(95, score);
}

function calculateCompletenessScore(sections) {
    const sectionCount = Object.values(sections).filter(v => v).length;
    return Math.min(95, 40 + (sectionCount * 7));
}

function calculateAIReadabilityScore(content, sections) {
    let score = 65;
    if (sections.examples) score += 15;
    if (sections.authentication) score += 10;
    if (sections.endpoints) score += 10;
    if (content.includes('curl')) score += 5;
    return Math.min(95, score);
}

function generateSmartRecommendations(sections, content) {
    const recommendations = [];
    
    if (!sections.examples) {
        recommendations.push({
            priority: 'high',
            category: 'Examples',
            title: 'Add code examples',
            description: 'Include curl examples and code snippets to help AI agents understand API usage'
        });
    }
    
    if (!sections.authentication) {
        recommendations.push({
            priority: 'high',
            category: 'Authentication',
            title: 'Document authentication methods',
            description: 'Specify how to authenticate with your API (API key, OAuth, etc.)'
        });
    }
    
    if (!content.includes('error') && !content.includes('status')) {
        recommendations.push({
            priority: 'medium',
            category: 'Documentation',
            title: 'Add error handling information',
            description: 'Document common errors and status codes'
        });
    }
    
    if (!content.includes('rate') && !content.includes('limit')) {
        recommendations.push({
            priority: 'medium',
            category: 'Technical',
            title: 'Specify rate limits',
            description: 'Include rate limiting information to help AI agents respect API limits'
        });
    }
    
    return recommendations.slice(0, 3);
}

// Export for use in evaluator.js
if (typeof window !== 'undefined') {
    window.handleEvaluatorAPI = handleEvaluatorAPI;
}