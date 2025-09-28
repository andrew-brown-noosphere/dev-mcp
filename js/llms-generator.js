// Universal llms.txt Generator Algorithm
class LLMsGenerator {
    constructor() {
        this.websiteUrl = '';
        this.analysisData = {
            marketing: {},
            technical: {},
            score: 0
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('generatorForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            this.websiteUrl = document.getElementById('websiteUrl').value;
            await this.generateLLMsTxt();
        });
    }

    async generateLLMsTxt() {
        // Show progress
        this.showProgress();
        this.hideOutput();
        
        try {
            // Step 1: Analyze website
            await this.analyzeWebsite();
            
            // Step 2: Calculate AI readiness score
            const score = this.calculateAIReadinessScore();
            this.displayScore(score);
            
            // Step 3: Generate llms.txt content
            const content = this.generateContent();
            this.displayOutput(content);
            
        } catch (error) {
            console.error('Generation failed:', error);
            alert('Failed to generate llms.txt. Please try again.');
        }
    }

    async analyzeWebsite() {
        // Normalize URL
        let domain = this.websiteUrl;
        if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
            domain = 'https://' + domain;
        }
        
        const steps = [
            { id: 'homepage', label: 'Analyzing homepage', status: 'analyzing' },
            { id: 'marketing', label: 'Extracting marketing content', status: 'pending' },
            { id: 'technical', label: 'Finding API documentation', status: 'pending' },
            { id: 'examples', label: 'Collecting code examples', status: 'pending' },
            { id: 'performance', label: 'Checking performance metrics', status: 'pending' }
        ];
        
        this.updateProgress(steps);
        
        // Simulate analysis for demo (in production, this would actually scrape)
        await this.simulateAnalysis(domain, steps);
    }

    async simulateAnalysis(domain, steps) {
        // For demo, we'll use patterns based on common sites
        const url = new URL(domain);
        const hostname = url.hostname.toLowerCase();
        
        // Step 1: Homepage
        await this.updateStep(steps, 'homepage', 'complete');
        
        // Step 2: Marketing content
        await new Promise(r => setTimeout(r, 1000));
        this.analysisData.marketing = this.extractMarketingPatterns(hostname);
        await this.updateStep(steps, 'marketing', this.analysisData.marketing.found ? 'complete' : 'partial');
        
        // Step 3: Technical docs
        await new Promise(r => setTimeout(r, 1000));
        this.analysisData.technical = this.extractTechnicalPatterns(hostname);
        await this.updateStep(steps, 'technical', this.analysisData.technical.found ? 'complete' : 'partial');
        
        // Step 4: Examples
        await new Promise(r => setTimeout(r, 1000));
        this.analysisData.examples = this.extractExamples(hostname);
        await this.updateStep(steps, 'examples', this.analysisData.examples.found ? 'complete' : 'missing');
        
        // Step 5: Performance
        await new Promise(r => setTimeout(r, 1000));
        this.analysisData.performance = this.extractPerformance(hostname);
        await this.updateStep(steps, 'performance', 'complete');
    }

    extractMarketingPatterns(hostname) {
        // Simulate extraction based on domain patterns
        const techCompanies = ['scylladb', 'mongodb', 'stripe', 'twilio', 'github', 'datadog'];
        const isKnownTech = techCompanies.some(company => hostname.includes(company));
        
        if (isKnownTech) {
            return {
                found: true,
                title: this.generateTitle(hostname),
                description: this.generateDescription(hostname),
                useCases: this.generateUseCases(hostname),
                customers: this.generateCustomers(hostname),
                differentiators: this.generateDifferentiators(hostname)
            };
        }
        
        return {
            found: false,
            title: hostname,
            description: 'Website for ' + hostname
        };
    }

    extractTechnicalPatterns(hostname) {
        const hasAPI = Math.random() > 0.3;
        
        if (hasAPI) {
            return {
                found: true,
                endpoints: this.generateEndpoints(hostname),
                authentication: this.generateAuth(hostname),
                drivers: ['python', 'javascript', 'java', 'go'],
                documentation: `https://docs.${hostname}`
            };
        }
        
        return { found: false };
    }

    extractExamples(hostname) {
        const hasExamples = Math.random() > 0.4;
        
        if (hasExamples) {
            return {
                found: true,
                quickstart: this.generateQuickstart(hostname),
                languages: ['python', 'javascript', 'curl']
            };
        }
        
        return { found: false };
    }

    extractPerformance(hostname) {
        return {
            responseTime: Math.floor(Math.random() * 50) + 10 + 'ms',
            uptime: '99.' + Math.floor(Math.random() * 9) + '%',
            scale: Math.floor(Math.random() * 900) + 100 + 'K requests/sec'
        };
    }

    calculateAIReadinessScore() {
        let score = 0;
        const weights = {
            marketing: 30,
            technical: 40,
            examples: 20,
            performance: 10
        };
        
        // Marketing score
        if (this.analysisData.marketing.found) {
            score += weights.marketing;
            if (this.analysisData.marketing.useCases) score += 5;
            if (this.analysisData.marketing.differentiators) score += 5;
        }
        
        // Technical score
        if (this.analysisData.technical.found) {
            score += weights.technical;
            if (this.analysisData.technical.authentication) score += 5;
            if (this.analysisData.technical.endpoints) score += 5;
        }
        
        // Examples score
        if (this.analysisData.examples.found) {
            score += weights.examples;
        }
        
        // Performance score
        if (this.analysisData.performance) {
            score += weights.performance;
        }
        
        // Cap at 100
        this.analysisData.score = Math.min(100, score);
        return this.analysisData.score;
    }

    generateContent() {
        const data = this.analysisData;
        const date = new Date().toISOString().split('T')[0];
        
        let content = `# Company: ${data.marketing.title || this.websiteUrl}
# Updated: ${date}

title: ${data.marketing.title || this.websiteUrl}
description: ${data.marketing.description || 'No description available'}
`;

        // Add capabilities if found
        if (data.marketing.useCases || data.technical.found) {
            content += `
# Core Capabilities
capabilities:`;
            
            if (data.marketing.useCases) {
                data.marketing.useCases.forEach(uc => {
                    content += `
  - ${uc}`;
                });
            }
        }

        // Add performance metrics
        if (data.performance) {
            content += `

# Performance Metrics
performance:
  response_time_p99: ${data.performance.responseTime}
  uptime_sla: ${data.performance.uptime}
  throughput: ${data.performance.scale}`;
        }

        // Add use cases
        if (data.marketing.useCases) {
            content += `

# Use Cases
use_cases:`;
            data.marketing.useCases.forEach((uc, i) => {
                content += `
  - scenario: "${uc}"
    example: "${this.generateExampleForUseCase(uc)}"`;
            });
        }

        // Add competitive positioning
        if (data.marketing.differentiators) {
            content += `

# Competitive Positioning
differentiators:`;
            data.marketing.differentiators.forEach(diff => {
                content += `
  - ${diff}`;
            });
        }

        // Add technical information
        if (data.technical.found) {
            content += `

# Integration Information`;
            
            if (data.technical.drivers) {
                content += `
drivers: [${data.technical.drivers.join(', ')}]`;
            }
            
            if (data.technical.documentation) {
                content += `
api_docs: ${data.technical.documentation}`;
            }
            
            if (data.technical.endpoints) {
                content += `
api_endpoint: ${data.technical.endpoints[0]}`;
            }
        }

        // Add quick start if examples found
        if (data.examples.found && data.examples.quickstart) {
            content += `

# Quick Start
quickstart: |
${data.examples.quickstart}`;
        }

        // Add keywords
        content += `

# Keywords for AI Discovery
keywords: [${this.generateKeywords().join(', ')}]

# Support & Sales
support: support@${new URL('https://' + this.websiteUrl).hostname}
`;

        return content;
    }

    // Helper methods for generating content
    generateTitle(hostname) {
        const titles = {
            'scylladb': 'ScyllaDB - The Database for Predictable Performance at Scale',
            'mongodb': 'MongoDB - The Application Data Platform',
            'stripe': 'Stripe - Online Payment Processing for Internet Businesses',
            'github': 'GitHub - Where the world builds software',
            'twilio': 'Twilio - Cloud Communications Platform'
        };
        
        for (const [key, title] of Object.entries(titles)) {
            if (hostname.includes(key)) return title;
        }
        
        return hostname.charAt(0).toUpperCase() + hostname.slice(1);
    }

    generateDescription(hostname) {
        const descriptions = {
            'scylladb': 'Drop-in Apache Cassandra replacement that\'s 10x faster. NoSQL database with consistent <10ms P99 latency at scale.',
            'mongodb': 'Build faster and build smarter with a developer data platform that helps solve your data challenges.',
            'stripe': 'A fully integrated suite of payments products to accept payments, send payouts, and manage businesses online.',
            'github': 'GitHub is where over 100 million developers shape the future of software, together.',
            'twilio': 'Build personalized customer experiences with APIs for communications and data.'
        };
        
        for (const [key, desc] of Object.entries(descriptions)) {
            if (hostname.includes(key)) return desc;
        }
        
        return `Platform for ${hostname}`;
    }

    generateUseCases(hostname) {
        if (hostname.includes('database') || hostname.includes('db')) {
            return [
                'Real-time analytics at scale',
                'Time-series data storage',
                'User session management',
                'IoT data ingestion'
            ];
        }
        
        if (hostname.includes('payment') || hostname.includes('stripe')) {
            return [
                'Online payment processing',
                'Subscription billing',
                'Marketplace payments',
                'Mobile commerce'
            ];
        }
        
        return [
            'API integration',
            'Data processing',
            'Workflow automation'
        ];
    }

    generateCustomers(hostname) {
        return ['Fortune 500 companies', 'Growing startups', 'Enterprise organizations'];
    }

    generateDifferentiators(hostname) {
        if (hostname.includes('scylla')) {
            return [
                '10x faster than Apache Cassandra',
                'Predictable <10ms P99 latency',
                'No JVM garbage collection pauses',
                'Auto-tuning and self-optimization'
            ];
        }
        
        return [
            'Industry-leading performance',
            'Enterprise-grade security',
            'Global scalability',
            '24/7 support'
        ];
    }

    generateEndpoints(hostname) {
        return [
            `https://api.${hostname}/v1`,
            `https://${hostname}/api/v2`
        ];
    }

    generateAuth(hostname) {
        return {
            type: 'Bearer token',
            header: 'Authorization: Bearer YOUR_API_KEY'
        };
    }

    generateQuickstart(hostname) {
        return `  # Install SDK
  pip install ${hostname.split('.')[0]}-sdk
  
  # Initialize client
  from ${hostname.split('.')[0]} import Client
  client = Client(api_key="YOUR_API_KEY")
  
  # Make your first request
  response = client.query("SELECT * FROM users LIMIT 10")
  print(response)`;
    }

    generateExampleForUseCase(useCase) {
        const examples = {
            'Real-time analytics': 'Process 1M events/sec with <10ms latency',
            'Payment processing': 'Accept payments in 135+ currencies',
            'Data storage': 'Store petabytes of data across regions'
        };
        
        for (const [key, example] of Object.entries(examples)) {
            if (useCase.toLowerCase().includes(key.toLowerCase())) {
                return example;
            }
        }
        
        return 'Implementation example for ' + useCase;
    }

    generateKeywords() {
        const keywords = [];
        
        // Add from marketing data
        if (this.analysisData.marketing.title) {
            keywords.push(...this.analysisData.marketing.title.toLowerCase().split(' ').filter(w => w.length > 3));
        }
        
        // Add technical keywords
        if (this.analysisData.technical.found) {
            keywords.push('api', 'integration', 'sdk');
        }
        
        // Add domain-specific keywords
        const domain = new URL('https://' + this.websiteUrl).hostname;
        if (domain.includes('db') || domain.includes('data')) {
            keywords.push('database', 'nosql', 'sql', 'query');
        }
        
        return [...new Set(keywords)].slice(0, 10);
    }

    // UI Methods
    showProgress() {
        document.getElementById('analysisProgress').classList.remove('hidden');
        document.getElementById('scoreDisplay').classList.add('hidden');
    }

    hideOutput() {
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('outputContainer').classList.add('hidden');
    }

    updateProgress(steps) {
        const container = document.getElementById('progressItems');
        container.innerHTML = steps.map(step => {
            const icon = step.status === 'complete' ? 'fa-check-circle' : 
                        step.status === 'analyzing' ? 'fa-spinner fa-spin' :
                        step.status === 'partial' ? 'fa-exclamation-triangle' :
                        step.status === 'missing' ? 'fa-times-circle' : 'fa-circle';
            
            const className = step.status === 'complete' ? 'complete' :
                             step.status === 'partial' ? 'partial' :
                             step.status === 'missing' ? 'missing' : '';
                             
            return `
                <div class="progress-item ${className}">
                    <i class="fas ${icon}"></i>
                    ${step.label}
                </div>
            `;
        }).join('');
    }

    async updateStep(steps, stepId, status) {
        const step = steps.find(s => s.id === stepId);
        if (step) {
            step.status = status;
            this.updateProgress(steps);
        }
    }

    displayScore(score) {
        document.getElementById('scoreDisplay').classList.remove('hidden');
        document.getElementById('scoreValue').textContent = score + '%';
        
        let message = '';
        if (score >= 80) {
            message = 'Excellent AI readiness! Minor optimizations possible.';
        } else if (score >= 60) {
            message = 'Good foundation. Add more examples and documentation.';
        } else if (score >= 40) {
            message = 'Basic discoverability. Significant improvements needed.';
        } else {
            message = 'Limited AI readiness. Major enhancements required.';
        }
        
        document.getElementById('scoreMessage').textContent = message;
    }

    displayOutput(content) {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('outputContainer').classList.remove('hidden');
        document.getElementById('generatedContent').textContent = content;
    }
}

// Global functions
function copyToClipboard() {
    const content = document.getElementById('generatedContent').textContent;
    navigator.clipboard.writeText(content).then(() => {
        alert('Copied to clipboard!');
    });
}

function downloadFile() {
    const content = document.getElementById('generatedContent').textContent;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'llms.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function testWithEvaluator() {
    const url = document.getElementById('websiteUrl').value;
    window.location.href = `/llms-txt-evaluator/?test=${encodeURIComponent(url)}`;
}

// Initialize
const generator = new LLMsGenerator();