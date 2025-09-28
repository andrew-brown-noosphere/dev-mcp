// Simple backend proxy for llms.txt evaluator
// This is a client-side simulation of the backend API

async function handleEvaluatorAPI(request) {
    const { url, domain } = request;
    
    // Normalize domain
    let normalizedDomain = domain;
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        normalizedDomain = 'https://' + domain;
    }
    
    const urlObj = new URL(normalizedDomain);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    
    // For demo purposes, return simulated results based on domain
    const timestamp = new Date().toISOString();
    
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
            recommendations: generateRecommendations(),
            grade: 'B+'
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
            ],
            grade: 'F'
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

// Export for use in evaluator.js
if (typeof window !== 'undefined') {
    window.handleEvaluatorAPI = handleEvaluatorAPI;
}