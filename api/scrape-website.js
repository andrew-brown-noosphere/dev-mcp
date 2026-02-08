// Website Scraping API for llms.txt Generator
// Note: This is a simplified version for demo purposes
// In production, you'd want more robust scraping with headless browser

async function scrapeWebsite(request) {
    const { domain } = request;
    
    // Normalize URL
    let url = domain;
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
        url = 'https://' + domain;
    }
    
    try {
        // Fetch homepage
        const response = await fetch(url);
        const html = await response.text();
        
        // Extract data using patterns
        const data = {
            marketing: extractMarketingContent(html, url),
            technical: extractTechnicalContent(html, url),
            examples: extractCodeExamples(html),
            performance: extractPerformanceMetrics(html)
        };
        
        return {
            success: true,
            data: data,
            url: url
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message,
            url: url
        };
    }
}

function extractMarketingContent(html, url) {
    const marketing = {
        found: false,
        title: '',
        description: '',
        useCases: [],
        differentiators: []
    };
    
    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
        marketing.title = titleMatch[1].trim();
        marketing.found = true;
    }
    
    // Extract meta description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    if (descMatch) {
        marketing.description = descMatch[1].trim();
    }
    
    // Extract headlines for value props
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
    
    // Look for performance claims (e.g., "10x faster", "99.99% uptime")
    const perfPattern = /(\d+x\s*(faster|better|more)|99\.\d+%|<\s*\d+ms|\d+k\s*ops)/gi;
    const perfMatches = html.match(perfPattern) || [];
    
    if (perfMatches.length > 0) {
        marketing.differentiators = perfMatches.slice(0, 4).map(m => m.trim());
    }
    
    // Look for use case patterns
    const useCasePatterns = [
        /use\s*cases?:?\s*([^<.]+)/gi,
        /perfect\s+for:?\s*([^<.]+)/gi,
        /built\s+for:?\s*([^<.]+)/gi
    ];
    
    useCasePatterns.forEach(pattern => {
        const matches = html.match(pattern) || [];
        matches.forEach(match => {
            const cleaned = match.replace(pattern, '$1').trim();
            if (cleaned.length > 10 && cleaned.length < 100) {
                marketing.useCases.push(cleaned);
            }
        });
    });
    
    return marketing;
}

function extractTechnicalContent(html, baseUrl) {
    const technical = {
        found: false,
        endpoints: [],
        documentation: null,
        authentication: null
    };
    
    // Look for API documentation links
    const docPatterns = [
        /href=["']([^"']*(?:docs|documentation|api|developer)[^"']*)/gi,
        /href=["']([^"']*\/api\/[^"']*)/gi
    ];
    
    docPatterns.forEach(pattern => {
        const matches = html.match(pattern) || [];
        matches.forEach(match => {
            const url = match.match(/href=["']([^"']+)/)[1];
            if (!technical.documentation && (url.includes('doc') || url.includes('api'))) {
                technical.documentation = resolveUrl(url, baseUrl);
                technical.found = true;
            }
        });
    });
    
    // Look for API endpoints
    const endpointPattern = /https?:\/\/[\w\-._]+\/api\/v?\d*[^\s"'<>]*/gi;
    const endpointMatches = html.match(endpointPattern) || [];
    if (endpointMatches.length > 0) {
        technical.endpoints = [...new Set(endpointMatches)].slice(0, 3);
        technical.found = true;
    }
    
    // Look for authentication mentions
    const authPatterns = [
        /api[\s\-_]*key/i,
        /bearer\s+token/i,
        /oauth/i,
        /authorization/i
    ];
    
    authPatterns.forEach(pattern => {
        if (pattern.test(html)) {
            technical.authentication = pattern.source.replace(/\\/g, '');
            technical.found = true;
        }
    });
    
    return technical;
}

function extractCodeExamples(html) {
    const examples = {
        found: false,
        languages: [],
        snippets: []
    };
    
    // Look for code blocks
    const codePattern = /<(?:pre|code)[^>]*>([^<]+)<\/(?:pre|code)>/gi;
    const codeMatches = html.match(codePattern) || [];
    
    if (codeMatches.length > 0) {
        examples.found = true;
        
        // Detect languages
        const langPatterns = {
            python: /import\s+\w+|def\s+\w+|pip\s+install/i,
            javascript: /const\s+\w+|require\(|npm\s+install/i,
            curl: /curl\s+-[A-Z]|--header/i,
            java: /public\s+class|import\s+java/i
        };
        
        codeMatches.forEach(code => {
            Object.entries(langPatterns).forEach(([lang, pattern]) => {
                if (pattern.test(code)) {
                    examples.languages.push(lang);
                }
            });
        });
        
        examples.languages = [...new Set(examples.languages)];
    }
    
    return examples;
}

function extractPerformanceMetrics(html) {
    const metrics = {
        responseTime: null,
        uptime: null,
        scale: null
    };
    
    // Response time patterns
    const rtPattern = /(\d+\s*m?s)\s*(response|latency|p99)/i;
    const rtMatch = html.match(rtPattern);
    if (rtMatch) {
        metrics.responseTime = rtMatch[1];
    }
    
    // Uptime patterns
    const uptimePattern = /99\.\d+%\s*(uptime|availability|SLA)/i;
    const uptimeMatch = html.match(uptimePattern);
    if (uptimeMatch) {
        metrics.uptime = uptimeMatch[0].match(/99\.\d+%/)[0];
    }
    
    // Scale patterns
    const scalePattern = /(\d+[KMB]?)\s*(requests?\/s|ops\/s|queries\/s|TPS)/i;
    const scaleMatch = html.match(scalePattern);
    if (scaleMatch) {
        metrics.scale = scaleMatch[0];
    }
    
    return metrics;
}

function resolveUrl(url, baseUrl) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }
    
    const base = new URL(baseUrl);
    if (url.startsWith('/')) {
        return base.origin + url;
    }
    
    return baseUrl + '/' + url;
}

// Export for use
if (typeof window !== 'undefined') {
    window.scrapeWebsite = scrapeWebsite;
}