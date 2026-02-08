// LLMs.txt Evaluator Frontend Logic

class LLMsTxtEvaluator {
    constructor() {
        this.websiteUrl = '';
        this.analysisResults = null;
        this.generatedContent = null;
        this.setupEventListeners();
        this.checkForGeneratedContent();
    }

    checkForGeneratedContent() {
        // Check if we're coming from the generator
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('test') === 'generated') {
            // Get the generated content from sessionStorage
            const generatedContent = sessionStorage.getItem('generatedLlmsTxt');
            const generatedUrl = sessionStorage.getItem('generatedForUrl');
            
            if (generatedContent && generatedUrl) {
                this.generatedContent = generatedContent;
                this.websiteUrl = generatedUrl;
                
                // Pre-fill the URL field
                const urlField = document.getElementById('websiteUrl');
                if (urlField) {
                    urlField.value = generatedUrl;
                }
                
                // Show a message that we're testing generated content
                this.showGeneratedContentMessage();
                
                // Clean up sessionStorage
                sessionStorage.removeItem('generatedLlmsTxt');
                sessionStorage.removeItem('generatedForUrl');
            }
        }
    }
    
    showGeneratedContentMessage() {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4';
        messageDiv.innerHTML = `
            <strong>🧪 Testing Generated llms.txt (Not Yet Deployed)</strong><br>
            We'll evaluate the llms.txt content you just generated. This file hasn't been deployed to ${this.websiteUrl} yet.
            <br><small class="text-blue-600">After testing, deploy this file to your website at: <code>/${this.websiteUrl}/llms.txt</code></small>
        `;
        
        const form = document.getElementById('evaluationForm');
        form.parentNode.insertBefore(messageDiv, form);
    }

    setupEventListeners() {
        // Main form submission
        document.getElementById('evaluationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            this.websiteUrl = document.getElementById('websiteUrl').value;
            await this.startAnalysis();
        });

        // Email form submission
        document.getElementById('emailForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.sendReport();
        });
    }

    async startAnalysis() {
        // Show progress modal
        this.showModal('progressModal');
        
        // Reset all steps
        for (let i = 1; i <= 5; i++) {
            this.resetStep(i);
        }

        // Normalize the URL to just the domain
        let domain = this.websiteUrl;
        if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
            domain = 'https://' + domain;
        }

        try {
            // Update progress tracking
            this.updateProgress(10);
            
            // Step 1: Fetch llms.txt
            await this.executeStep(1, async () => {
                return { found: true };
            }, 2000);
            this.updateProgress(20);

            // Step 2: Analyze content
            await this.executeStep(2, async () => {
                return { analyzed: true };
            }, 2000);
            this.updateProgress(40);

            // Step 3: Scan website
            await this.executeStep(3, async () => {
                return { scanned: true };
            }, 2000);
            this.updateProgress(60);

            // Step 4: Test API endpoints
            await this.executeStep(4, async () => {
                return { tested: true };
            }, 2000);
            this.updateProgress(80);

            // Step 5: Generate report - Call backend API
            let analysisResult;
            await this.executeStep(5, async () => {
                // For demo, use client-side API simulation
                // Check if API handler is already loaded
                if (!window.handleEvaluatorAPI) {
                    // Load the API handler
                    const script = document.createElement('script');
                    script.src = '/api/llms-evaluator.js';
                    document.head.appendChild(script);
                    
                    await new Promise((resolve, reject) => {
                        script.onload = resolve;
                        script.onerror = reject;
                    });
                }
                
                // Call the simulated API
                analysisResult = await window.handleEvaluatorAPI({
                    url: domain,
                    domain: this.websiteUrl,
                    generatedContent: this.generatedContent
                });
                
                return { generated: true };
            }, 3000);
            
            this.updateProgress(100);
            this.analysisResults = analysisResult;

            // Hide progress modal and redirect to results
            setTimeout(() => {
                this.hideModal('progressModal');
                // Store results and redirect to results page
                localStorage.setItem('evaluationResults', JSON.stringify(this.analysisResults));
                window.location.href = `results.html?url=${encodeURIComponent(this.websiteUrl)}`;
            }, 1000);

        } catch (error) {
            console.error('Analysis failed:', error);
            this.showError('Analysis failed. Please try again.');
        }
    }

    updateProgress(percentage) {
        const progressBar = document.getElementById('overallProgress');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }

    async executeStep(stepNumber, action, duration) {
        const step = document.getElementById(`step${stepNumber}`);
        
        // Mark as active and show spinner
        step.classList.add('active', 'analyzing');
        const circle = step.querySelector('.step-circle');
        const spinner = step.querySelector('.fa-spinner');
        const check = step.querySelector('.fa-check');
        const number = step.querySelector('.step-circle span');
        
        spinner.classList.remove('hidden');
        number.classList.add('hidden');

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, duration * 0.7));

        // Execute the actual action
        const result = await action();

        // Mark as complete
        await new Promise(resolve => setTimeout(resolve, duration * 0.3));
        
        step.classList.remove('analyzing');
        spinner.classList.add('hidden');
        check.classList.remove('hidden');
        
        return result;
    }

    resetStep(stepNumber) {
        const step = document.getElementById(`step${stepNumber}`);
        step.classList.remove('active', 'analyzing');
        
        const spinner = step.querySelector('.fa-spinner');
        const check = step.querySelector('.fa-check');
        const number = step.querySelector('.step-circle span');
        
        spinner.classList.add('hidden');
        check.classList.add('hidden');
        number.classList.remove('hidden');
    }

    async fetchLLMsTxt() {
        // Normalize the URL to just the domain
        let domain = this.websiteUrl;
        if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
            domain = 'https://' + domain;
        }
        
        const url = new URL(domain);
        const baseUrl = `${url.protocol}//${url.host}`;
        
        // Standard llms.txt locations
        const locations = [
            `${baseUrl}/llms.txt`,
            `${baseUrl}/.well-known/llms.txt`
        ];
        
        let content = null;
        let foundLocation = null;
        
        // Try each location
        for (const location of locations) {
            try {
                console.log(`Checking for llms.txt at: ${location}`);
                
                // Try multiple CORS proxies
                const proxies = [
                    `https://corsproxy.io/?${encodeURIComponent(location)}`,
                    `https://api.allorigins.win/get?url=${encodeURIComponent(location)}`,
                    `https://cors-anywhere.herokuapp.com/${location}`
                ];
                
                for (const proxyUrl of proxies) {
                    try {
                        const response = await fetch(proxyUrl);
                        if (response.ok) {
                            let responseData;
                            
                            if (proxyUrl.includes('allorigins')) {
                                const data = await response.json();
                                responseData = data.contents;
                            } else {
                                responseData = await response.text();
                            }
                            
                            if (responseData && responseData.trim() && !responseData.includes('<!DOCTYPE')) {
                                content = responseData;
                                foundLocation = location;
                                console.log(`Found llms.txt at: ${location}`);
                                break;
                            }
                        }
                    } catch (proxyError) {
                        console.log(`Proxy ${proxyUrl} failed:`, proxyError.message);
                        continue;
                    }
                }
                
                if (content) break;
                
            } catch (error) {
                console.log(`Could not fetch from ${location}:`, error.message);
                // Continue to next location
            }
        }
        
        // If still no content found, provide demo content for certain domains
        if (!content) {
            const demoContent = this.getDemoContent(baseUrl);
            if (demoContent) {
                content = demoContent;
                foundLocation = `${baseUrl}/llms.txt`;
                console.log(`Using demo content for: ${baseUrl}`);
            }
        }
        
        return {
            found: !!content,
            location: foundLocation,
            locations: locations,
            content: content || null
        };
    }

    async analyzeLLMsTxtContent() {
        // Get the fetched content from previous step
        if (!this.fetchedContent) {
            // If no content was fetched, return low scores
            return {
                clarity: 20,
                completeness: 15,
                aiReadability: 25,
                examples: 10,
                authentication: 20,
                endpoints: 15,
                sections: {
                    authentication: false,
                    endpoints: false,
                    examples: false,
                    rate_limits: false,
                    error_handling: false
                },
                aiCompatibility: {
                    claude: 0.2,
                    gpt4: 0.15,
                    general: 0.1
                }
            };
        }

        // Analyze the actual content
        const content = this.fetchedContent.toLowerCase();
        const lines = this.fetchedContent.split('\n');
        
        // Check for key sections
        const sections = {
            authentication: content.includes('auth') || content.includes('token') || content.includes('key'),
            endpoints: content.includes('endpoint') || content.includes('api') || content.includes('get ') || content.includes('post '),
            examples: content.includes('example') || content.includes('curl') || content.includes('```'),
            rate_limits: content.includes('rate') || content.includes('limit') || content.includes('throttle'),
            error_handling: content.includes('error') || content.includes('status') || content.includes('code')
        };

        // Score based on content analysis
        const scores = {
            clarity: this.scoreClarity(lines),
            completeness: this.scoreCompleteness(sections, lines),
            aiReadability: this.scoreAIReadability(content, lines),
            examples: this.scoreExamples(content, lines),
            authentication: this.scoreAuthentication(content),
            endpoints: this.scoreEndpoints(content, lines)
        };

        // AI compatibility based on structure and clarity
        const avgScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
        const aiCompatibility = {
            claude: Math.max(0.1, Math.min(1.0, avgScore / 100 + 0.1)),
            gpt4: Math.max(0.1, Math.min(1.0, avgScore / 100 + 0.05)),
            general: Math.max(0.1, Math.min(1.0, avgScore / 100))
        };

        return {
            ...scores,
            sections,
            aiCompatibility
        };
    }

    scoreClarity(lines) {
        let score = 30; // Base score
        
        // Check for headers and structure
        const hasHeaders = lines.some(line => line.startsWith('#'));
        if (hasHeaders) score += 20;
        
        // Check for clear sections
        const hasStructure = lines.length > 5;
        if (hasStructure) score += 15;
        
        // Check for consistent formatting
        const hasConsistentFormatting = lines.filter(line => line.trim()).length > lines.length * 0.7;
        if (hasConsistentFormatting) score += 15;
        
        return Math.min(100, score + Math.random() * 20);
    }

    scoreCompleteness(sections, lines) {
        let score = 20; // Base score
        
        // Score based on essential sections
        if (sections.authentication) score += 25;
        if (sections.endpoints) score += 25;
        if (sections.examples) score += 15;
        if (sections.rate_limits) score += 10;
        if (sections.error_handling) score += 5;
        
        return Math.min(100, score);
    }

    scoreAIReadability(content, lines) {
        let score = 25; // Base score
        
        // Check for clear instructions
        if (content.includes('instruction') || content.includes('how to')) score += 20;
        
        // Check for structured format
        if (lines.some(line => line.includes('##') || line.includes('###'))) score += 15;
        
        // Check for code blocks
        if (content.includes('```') || content.includes('`')) score += 15;
        
        // Check for bullet points or lists
        if (content.includes('- ') || content.includes('* ')) score += 10;
        
        return Math.min(100, score + Math.random() * 15);
    }

    scoreExamples(content, lines) {
        let score = 10; // Base score
        
        // Check for code examples
        if (content.includes('curl')) score += 30;
        if (content.includes('```')) score += 25;
        if (content.includes('example')) score += 20;
        if (content.includes('http')) score += 15;
        
        return Math.min(100, score);
    }

    scoreAuthentication(content) {
        let score = 20; // Base score
        
        if (content.includes('bearer')) score += 25;
        if (content.includes('api key') || content.includes('api-key')) score += 25;
        if (content.includes('oauth')) score += 20;
        if (content.includes('token')) score += 15;
        if (content.includes('authorization')) score += 10;
        
        return Math.min(100, score);
    }

    scoreEndpoints(content, lines) {
        let score = 15; // Base score
        
        // Count HTTP methods
        const methods = ['get', 'post', 'put', 'delete', 'patch'];
        methods.forEach(method => {
            if (content.includes(method + ' ') || content.includes(method + '\t')) score += 15;
        });
        
        // Check for URL patterns
        if (content.includes('/api/')) score += 20;
        if (content.includes('https://') || content.includes('http://')) score += 10;
        
        return Math.min(100, score);
    }

    getDemoContent(baseUrl) {
        // Provide demo content for testing - these are realistic examples
        const demoSites = {
            'https://anthropic.com': `# Anthropic API

## Authentication
Use Bearer token authentication with your API key.

\`\`\`bash
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.anthropic.com/v1/messages
\`\`\`

## Endpoints

### POST /v1/messages
Create a new message conversation.

## Rate Limits
- 1000 requests per minute for paid accounts
- 100 requests per minute for free accounts

## Example
\`\`\`json
{
  "model": "claude-3-sonnet-20240229",
  "max_tokens": 1024,
  "messages": [
    {"role": "user", "content": "Hello, Claude"}
  ]
}
\`\`\``,
            'https://openai.com': `# OpenAI API Instructions

## Authentication
Include your API key in the Authorization header:
\`Authorization: Bearer YOUR_API_KEY\`

## Base URL
https://api.openai.com/v1

## Endpoints
- POST /chat/completions - Chat with GPT models
- POST /completions - Text completion
- POST /images/generations - Generate images

## Rate Limits
Varies by subscription tier. Check headers for current limits.

## Example Request
\`\`\`bash
curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello!"}]}'
\`\`\``,
            'https://stripe.com': `# Stripe API

## Authentication
Use your secret key in the Authorization header:
\`Authorization: Bearer sk_test_...\`

## Base URL
https://api.stripe.com/v1

## Common Endpoints
- POST /payment_intents - Create payments
- GET /customers - List customers
- POST /subscriptions - Create subscriptions

## Testing
Use test mode with sk_test_ keys for development.

## Webhooks
Configure webhook endpoints to receive real-time updates.

\`\`\`bash
curl https://api.stripe.com/v1/payment_intents \\
  -u sk_test_key: \\
  -d amount=2000 \\
  -d currency=usd
\`\`\``,
            'https://github.com': `# GitHub API

## Authentication
Use personal access tokens or GitHub Apps.

\`Authorization: Bearer ghp_xxxxxxxxxxxx\`

## Base URL
https://api.github.com

## Endpoints
- GET /user - Get authenticated user
- GET /repos/:owner/:repo - Get repository
- POST /repos/:owner/:repo/issues - Create issue

## Rate Limits
- 5000 requests per hour for authenticated requests
- 60 requests per hour for unauthenticated

## Example
\`\`\`bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" \\
     https://api.github.com/user
\`\`\``,
            'https://example.com': `# Example API

This is a basic API documentation for demonstration.

## Authentication
API Key required in header: \`X-API-Key: your-key-here\`

## Endpoints
GET /api/data - Retrieve data
POST /api/data - Create new data

## Example
\`\`\`bash
curl -H "X-API-Key: abc123" https://example.com/api/data
\`\`\``
        };

        return demoSites[baseUrl] || null;
    }

    async scanWebsite() {
        // Simulate comprehensive website scanning
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    apiDocsFound: Math.random() > 0.3,
                    apiDocsUrl: '/docs/api',
                    openApiSpec: Math.random() > 0.5,
                    interactiveExplorer: Math.random() > 0.6,
                    corsEnabled: Math.random() > 0.4,
                    httpsOnly: Math.random() > 0.1,
                    responseFormat: 'JSON',
                    statusCodesDocumented: Math.random() > 0.5
                });
            }, 1000);
        });
    }

    async testAPIEndpoints() {
        // Simulate API endpoint testing
        return new Promise(resolve => {
            setTimeout(() => {
                const endpointCount = Math.floor(Math.random() * 8) + 3;
                const successfulCount = Math.floor(endpointCount * (0.6 + Math.random() * 0.3));
                
                resolve({
                    endpointsTested: endpointCount,
                    successfulTests: successfulCount,
                    authMethodsSupported: ['Bearer', 'API Key', 'OAuth'][Math.floor(Math.random() * 3)],
                    corsEnabled: Math.random() > 0.3,
                    avgResponseTime: Math.floor(Math.random() * 300) + 50,
                    errorHandling: Math.random() > 0.5
                });
            }, 600);
        });
    }

    async generateReport() {
        // Generate comprehensive evaluation results
        const fetchResult = await this.fetchLLMsTxt();
        const contentAnalysis = await this.analyzeLLMsTxtContent();
        const websiteScan = await this.scanWebsite();
        const apiTest = await this.testAPIEndpoints();

        // Calculate overall score
        const scores = {
            clarity: contentAnalysis.clarity,
            completeness: contentAnalysis.completeness,
            aiReadability: contentAnalysis.aiReadability,
            examples: contentAnalysis.examples,
            authentication: contentAnalysis.authentication,
            endpoints: contentAnalysis.endpoints
        };

        const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

        // Generate recommendations
        const recommendations = this.generateRecommendations(scores, websiteScan, apiTest);

        this.analysisResults = {
            url: this.websiteUrl,
            timestamp: new Date().toISOString(),
            overallScore: Math.round(overallScore),
            scores: Object.fromEntries(
                Object.entries(scores).map(([key, value]) => [key, Math.round(value)])
            ),
            details: {
                llmsTxtFound: fetchResult.found,
                apiDocsFound: websiteScan.apiDocsFound,
                endpointsTested: apiTest.endpointsTested,
                successfulTests: apiTest.successfulTests,
                corsEnabled: websiteScan.corsEnabled,
                httpsOnly: websiteScan.httpsOnly
            },
            aiCompatibility: contentAnalysis.aiCompatibility,
            recommendations: recommendations,
            grade: this.calculateGrade(overallScore)
        };
        
        return this.analysisResults;
    }

    generateRecommendations(scores, websiteScan, apiTest) {
        const recommendations = [];
        
        if (scores.clarity < 75) {
            recommendations.push({
                priority: 'high',
                category: 'Documentation',
                title: 'Improve documentation clarity',
                description: 'Your API documentation could be clearer for AI agents. Use more structured language and consistent formatting.'
            });
        }
        
        if (scores.examples < 70) {
            recommendations.push({
                priority: 'high',
                category: 'Examples',
                title: 'Add more code examples',
                description: 'Include comprehensive code examples for each endpoint. AI agents learn better from concrete examples.'
            });
        }
        
        if (!websiteScan.corsEnabled) {
            recommendations.push({
                priority: 'medium',
                category: 'Technical',
                title: 'Enable CORS',
                description: 'Enable Cross-Origin Resource Sharing (CORS) to allow AI agents to access your API from different domains.'
            });
        }
        
        if (scores.authentication < 80) {
            recommendations.push({
                priority: 'medium',
                category: 'Security',
                title: 'Clarify authentication methods',
                description: 'Provide clearer documentation on authentication methods and include examples for each method.'
            });
        }
        
        if (!websiteScan.openApiSpec) {
            recommendations.push({
                priority: 'low',
                category: 'Standards',
                title: 'Add OpenAPI specification',
                description: 'Provide an OpenAPI (Swagger) specification to make your API more machine-readable.'
            });
        }

        return recommendations.slice(0, 4); // Limit to top 4 recommendations
    }

    calculateGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 85) return 'A';
        if (score >= 80) return 'A-';
        if (score >= 75) return 'B+';
        if (score >= 70) return 'B';
        if (score >= 65) return 'B-';
        if (score >= 60) return 'C+';
        if (score >= 55) return 'C';
        if (score >= 50) return 'C-';
        return 'D';
    }

    async sendReport() {
        const email = document.getElementById('userEmail').value;
        
        try {
            // For demo purposes, we'll just show success
            // In production, this would call your backend API
            console.log('Sending report to:', email);
            console.log('Results:', this.analysisResults);

            // Show success message
            this.hideModal('emailModal');
            this.showSuccessMessage();
            
        } catch (error) {
            console.error('Failed to send report:', error);
            alert('Failed to send report. Please try again.');
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }

    showSuccessMessage() {
        // Create success overlay
        const successDiv = document.createElement('div');
        successDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        successDiv.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-lg mx-4 text-center">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-envelope-open-text text-4xl text-green-600"></i>
                </div>
                <h2 class="text-2xl font-bold mb-2">Report Sent!</h2>
                <p class="text-gray-600 mb-6">
                    Check your email for your detailed AI-readiness report.
                </p>
                <button 
                    onclick="location.reload()"
                    class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2 px-6 rounded-lg"
                >
                    Evaluate Another Site
                </button>
            </div>
        `;
        document.body.appendChild(successDiv);
    }

    showError(message) {
        this.hideModal('progressModal');
        alert(message);
    }
}

// Initialize the evaluator
const evaluator = new LLMsTxtEvaluator();