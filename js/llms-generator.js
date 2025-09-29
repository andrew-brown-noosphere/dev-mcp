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
            { id: 'homepage', label: 'Scanning website', status: 'analyzing' },
            { id: 'marketing', label: 'Scanning content library', status: 'pending' },
            { id: 'technical', label: 'Finding technical documentation', status: 'pending' },
            { id: 'examples', label: 'Looking for use cases & examples', status: 'pending' },
            { id: 'performance', label: 'Analyzing capabilities', status: 'pending' },
            { id: 'ai-analysis', label: 'AI generating comprehensive llms.txt', status: 'pending' }
        ];
        
        this.updateProgress(steps);
        
        // Try real scanning first, fallback to simulation
        try {
            // Use Vercel endpoint in production, local in development
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const scannerUrl = isLocal 
                ? 'http://localhost:3001/api/scan'
                : '/api/scan'; // Vercel will handle this
            
            const response = await fetch(scannerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: domain })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    console.log('Using real scraped data');
                    // Pass the full result to get aiGeneratedLLMsTxt
                    await this.processRealData(result, steps);
                    return;
                } else {
                    console.error('Scanner API error:', result.error);
                    throw new Error(result.error);
                }
            } else {
                const error = await response.text();
                console.error('Scanner API HTTP error:', response.status, error);
                throw new Error(`Scanner API returned ${response.status}`);
            }
        } catch (error) {
            console.log('Scanner not available, using simulation');
        }
        
        // Fallback to simulation
        await this.simulateAnalysis(domain, steps);
    }

    async processRealData(result, steps) {
        // Process real scraped data
        const data = result.data;
        await this.updateStep(steps, 'homepage', 'complete');
        
        // Process marketing data
        await new Promise(r => setTimeout(r, 500));
        this.analysisData.marketing = data.marketing;
        await this.updateStep(steps, 'marketing', data.marketing.found ? 'complete' : 'partial');
        
        // Process technical data
        await new Promise(r => setTimeout(r, 500));
        this.analysisData.technical = data.technical;
        await this.updateStep(steps, 'technical', data.technical.found ? 'complete' : 'partial');
        
        // Process examples
        await new Promise(r => setTimeout(r, 500));
        this.analysisData.examples = {
            found: data.technical.code_examples && data.technical.code_examples.length > 0,
            languages: this.detectLanguages(data.technical.code_examples),
            quickstart: data.technical.getting_started
        };
        await this.updateStep(steps, 'examples', this.analysisData.examples.found ? 'complete' : 'missing');
        
        // Process performance
        await new Promise(r => setTimeout(r, 500));
        this.analysisData.performance = data.performance;
        await this.updateStep(steps, 'performance', 'complete');
        
        // Show AI thinking step
        await new Promise(r => setTimeout(r, 1000));
        await this.updateStep(steps, 'ai-analysis', 'analyzing');
        
        // Add thinking animation
        this.showAIThinking();
        
        // Wait to simulate AI processing (actual processing happens on backend)
        await new Promise(r => setTimeout(r, 3000));
        
        // Store AI-generated content if available (from top-level result)
        if (result.aiGeneratedLLMsTxt) {
            // Clean up the content - remove markdown code blocks if present
            let content = result.aiGeneratedLLMsTxt;
            if (content.startsWith('```yaml') || content.startsWith('```')) {
                content = content.replace(/^```[^\n]*\n/, '').replace(/\n```$/, '');
            }
            this.analysisData.aiGeneratedContent = content;
            this.analysisData.generatedWithAI = true;
            await this.updateStep(steps, 'ai-analysis', 'complete');
            console.log('Using AI-generated llms.txt content');
        } else {
            await this.updateStep(steps, 'ai-analysis', 'partial');
        }
        
        this.hideAIThinking();
    }
    
    detectLanguages(examples) {
        if (!examples || examples.length === 0) return [];
        
        const languages = new Set();
        examples.forEach(code => {
            if (code.includes('import') || code.includes('def ')) languages.add('Python');
            if (code.includes('const') || code.includes('function')) languages.add('JavaScript');
            if (code.includes('curl')) languages.add('cURL');
            if (code.includes('public class')) languages.add('Java');
            if (code.includes('func ')) languages.add('Go');
        });
        
        return Array.from(languages);
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
        
        // Step 6: AI Analysis (simulated)
        await new Promise(r => setTimeout(r, 1000));
        await this.updateStep(steps, 'ai-analysis', 'analyzing');
        this.showAIThinking();
        await new Promise(r => setTimeout(r, 2500));
        await this.updateStep(steps, 'ai-analysis', 'partial');
        this.hideAIThinking();
    }

    extractMarketingPatterns(hostname) {
        // For simulation mode only - return minimal placeholder data
        // Real intelligence comes from AI analysis of scraped content
        return {
            found: false,
            title: this.formatHostnameAsTitle(hostname),
            description: `Discovering services and capabilities for ${hostname}...`,
            useCases: [],
            differentiators: [],
            blog_insights: [],
            testimonials: [],
            workshops: [],
            technical_resources: [],
            customers: [],
            category: 'analyzing'
        };
    }

    extractTechnicalPatterns(hostname) {
        // Minimal placeholder - real data comes from scraping/AI
        return { 
            found: false,
            message: 'Awaiting AI analysis of technical capabilities...'
        };
    }

    extractExamples(hostname) {
        // Minimal placeholder - real data comes from scraping/AI
        return { 
            found: false,
            message: 'Awaiting AI discovery of code examples...'
        };
    }

    extractPerformance(hostname) {
        // Minimal placeholder - real data comes from scraping/AI
        return {
            message: 'Performance metrics will be discovered by AI analysis'
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
        // If we have AI-generated content, use it directly
        if (this.analysisData.aiGeneratedContent) {
            // Check if we need to append MCP config
            const mcpServerUrl = document.getElementById('mcpServerUrl')?.value;
            const mcpAuthType = document.getElementById('mcpAuthType')?.value;
            
            if (mcpServerUrl) {
                return this.appendMCPConfig(this.analysisData.aiGeneratedContent, mcpServerUrl, mcpAuthType);
            }
            return this.analysisData.aiGeneratedContent;
        }
        
        // Fallback when AI generation is not available
        const data = this.analysisData;
        const date = new Date().toISOString().split('T')[0];
        const domain = new URL('https://' + this.websiteUrl).hostname;
        
        // Baseline template when scanner/AI unavailable
        let content = `# ${this.formatHostnameAsTitle(domain)}
# Generated: ${date}
# Note: Run with AI scanner for accurate marketing content from ${domain}

title: ${data.marketing.title || this.formatHostnameAsTitle(domain)}
description: |
  Visit ${domain} to see their actual positioning and value proposition.
  The AI scanner will extract their real marketing messaging.

# Quick Links
homepage: https://${domain}
documentation: https://docs.${domain}
api: https://api.${domain}
support: support@${domain}

# Common Patterns
api_endpoints:
  - https://api.${domain}/v1
  - https://${domain}/api

# Note: Scanner unavailable - showing basic template
# To get AI-generated content with real marketing copy:
# 1. Check scanner service status
# 2. Try again in a few moments
`;

        // Check for MCP config in template mode too
        const mcpServerUrl = document.getElementById('mcpServerUrl')?.value;
        const mcpAuthType = document.getElementById('mcpAuthType')?.value;
        
        if (mcpServerUrl) {
            content = this.appendMCPConfig(content, mcpServerUrl, mcpAuthType);
        }

        return content;
    }
    
    appendMCPConfig(content, serverUrl, authType = 'api-key') {
        const mcpSection = `

# MCP (Model Context Protocol) Integration
# This enables AI agents to directly connect and use our tools
mcp:
  server: ${serverUrl}
  protocol: model-context-protocol
  version: 1.0
  
  authentication:
    type: ${authType}
    ${authType === 'api-key' ? 'header: X-API-Key' : ''}
    ${authType === 'oauth' ? 'flow: client_credentials' : ''}
  
  # Available tools via MCP
  tools:
    - name: quick_start
      description: Get started with our API in seconds
      
    - name: generate_code
      description: Generate integration code for your use case
      
    - name: test_connection
      description: Test your API connection and credentials
      
    - name: run_query
      description: Execute queries against our service
      
    - name: get_schema
      description: Get schema information for your data
  
  # Connection instructions for AI agents
  connect_instructions: |
    To connect via MCP:
    1. Use the WebSocket endpoint: ${serverUrl}
    2. Authenticate with your API key
    3. Call listTools() to see all available operations
    4. Use tools directly for instant integration
    
  # Auto-discovery beacon
  discovery_beacon: ${serverUrl}/discover`;
        
        return content + mcpSection;
    }

    // Helper methods for generating content
    formatHostnameAsTitle(hostname) {
        // Just clean up the hostname for display
        let cleanName = hostname
            .replace(/^www\./, '')
            .replace(/\.(com|org|io|dev|ai|net)$/, '');
        
        return cleanName
            .split(/[.-]/)
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }

    generateTitle(hostname) {
        // This is only used as fallback - real title comes from AI
        return this.formatHostnameAsTitle(hostname);
    }

    generateDescription(hostname) {
        // This is only used as fallback - real description comes from AI
        return `AI-powered analysis will determine the actual services and capabilities of ${hostname}`;
    }

    generateMarketingDescription(domain) {
        // Placeholder when scanner unavailable
        return `Company description will be extracted from ${domain}`;
    }

    generateSmartPatterns(domain) {
        const lower = domain.toLowerCase();
        let patterns = [];
        
        // Detect industry/category
        if (lower.includes('pay') || lower.includes('stripe')) {
            patterns.push('category: payment_processing');
            patterns.push('industry: fintech');
        } else if (lower.includes('db') || lower.includes('data')) {
            patterns.push('category: database');
            patterns.push('industry: data_infrastructure');
        } else if (lower.includes('auth') || lower.includes('identity')) {
            patterns.push('category: authentication');
            patterns.push('industry: security');
        } else if (lower.includes('api')) {
            patterns.push('category: api_platform');
            patterns.push('industry: developer_tools');
        } else {
            patterns.push('category: technology');
            patterns.push('industry: software');
        }
        
        // Add common patterns
        patterns.push('type: b2b_saas');
        patterns.push('deployment: cloud_hosted');
        
        return patterns.join('\n');
    }

    generateMarketingKeywords(domain) {
        const keywords = [];
        const lower = domain.toLowerCase();
        
        // Extract company name parts
        const parts = lower.replace(/\.(com|org|io|dev|ai|net)$/, '').split(/[-._]/);
        keywords.push(...parts.filter(p => p.length > 2));
        
        // Basic keywords until real ones are extracted
        keywords.push('api', 'integration', 'platform');
        
        return keywords;
    }

    generateUseCases(hostname) {
        // Placeholder - real use cases come from AI
        return [];
    }

    generateUseCasesForCategory(category, hostname) {
        // Placeholder - real use cases come from AI
        return [];
    }

    generateCustomers(hostname) {
        // Placeholder - real customers come from AI
        return [];
    }

    generateDifferentiators(hostname) {
        // Placeholder - real differentiators come from AI
        return [];
    }

    generateDifferentiatorsForCategory(category, hostname) {
        // Placeholder - real differentiators come from AI
        return [];
    }

    // All these methods are no longer needed - AI handles everything
    generateEndpoints(hostname) { return []; }
    generateAuth(hostname) { return {}; }
    generateQuickstart(hostname) { return ''; }
    generateExampleForUseCase(useCase) { return ''; }
    generateKeywords() { return []; }

    // UI Methods
    showProgress() {
        const progressEl = document.getElementById('analysisProgress');
        const scoreEl = document.getElementById('scoreDisplay');
        
        if (progressEl) {
            progressEl.classList.remove('hidden');
            console.log('Showing progress element');
        } else {
            console.error('analysisProgress element not found');
        }
        
        if (scoreEl) {
            scoreEl.classList.add('hidden');
        }
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
        
        // Show MCP config if high score
        if (score >= 70) {
            document.getElementById('mcpConfig').classList.remove('hidden');
        }
        
        let message = '';
        if (score >= 80) {
            message = 'Excellent AI readiness! Consider adding MCP for direct integration.';
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
        
        // Show AI badge if content was AI-generated
        if (this.analysisData.generatedWithAI) {
            this.showAIGeneratedBadge();
        }
    }
    
    showAIGeneratedBadge() {
        // Add badge to output section header
        const outputHeader = document.querySelector('.output-section h2');
        if (outputHeader && !outputHeader.querySelector('.ai-badge')) {
            const badge = document.createElement('span');
            badge.className = 'ai-badge inline-flex items-center ml-3 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm';
            badge.innerHTML = `
                <i class="fas fa-sparkles mr-1"></i>
                AI Generated
            `;
            outputHeader.appendChild(badge);
        }
    }
    
    showAIThinking() {
        // Find the AI analysis step and add special thinking animation
        const aiStep = document.querySelector('.progress-item:last-child');
        if (aiStep) {
            aiStep.innerHTML = `
                <i class="fas fa-brain fa-pulse" style="color: #7850ff;"></i>
                <span style="color: #7850ff; font-weight: 600;">AI is analyzing content and crafting your llms.txt...</span>
                <div class="ai-thinking-dots" style="display: inline-block; margin-left: 8px;">
                    <span style="animation: blink 1.4s infinite;">.</span>
                    <span style="animation: blink 1.4s infinite 0.2s;">.</span>
                    <span style="animation: blink 1.4s infinite 0.4s;">.</span>
                </div>
            `;
            
            // Add CSS animation if not already added
            if (!document.getElementById('ai-thinking-styles')) {
                const style = document.createElement('style');
                style.id = 'ai-thinking-styles';
                style.textContent = `
                    @keyframes blink {
                        0%, 60% { opacity: 0; }
                        100% { opacity: 1; }
                    }
                    .fa-pulse {
                        animation: fa-pulse 2s infinite;
                    }
                    @keyframes fa-pulse {
                        0% { transform: scale(1); opacity: 0.8; }
                        50% { transform: scale(1.1); opacity: 1; }
                        100% { transform: scale(1); opacity: 0.8; }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
    
    hideAIThinking() {
        // The status will be updated by updateStep, so nothing special needed here
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
    // Get the generated content
    const content = document.getElementById('generatedContent').textContent;
    const url = document.getElementById('websiteUrl').value;
    
    if (!content) {
        alert('Please generate an llms.txt file first');
        return;
    }
    
    // Store the generated content in sessionStorage to pass to evaluator
    sessionStorage.setItem('generatedLlmsTxt', content);
    sessionStorage.setItem('generatedForUrl', url);
    
    // Redirect to evaluator with special flag
    window.location.href = `/llms-txt-evaluator/?test=generated&url=${encodeURIComponent(url)}`;
}

// Initialize
const generator = new LLMsGenerator();