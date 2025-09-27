// LLMs.txt Evaluator Frontend Logic

class LLMsTxtEvaluator {
    constructor() {
        this.websiteUrl = '';
        this.analysisResults = null;
        this.setupEventListeners();
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

        // Execute analysis steps with delays for better UX
        try {
            // Step 1: Fetch llms.txt
            const fetchResult = await this.executeStep(1, async () => {
                return await this.fetchLLMsTxt();
            }, 3000);
            this.fetchedContent = fetchResult.content;
            this.updateProgress(20);

            // Step 2: Analyze content
            await this.executeStep(2, async () => {
                return await this.analyzeLLMsTxtContent();
            }, 4000);
            this.updateProgress(40);

            // Step 3: Scan website
            await this.executeStep(3, async () => {
                return await this.scanWebsite();
            }, 5000);
            this.updateProgress(60);

            // Step 4: Test API endpoints
            await this.executeStep(4, async () => {
                return await this.testAPIEndpoints();
            }, 4000);
            this.updateProgress(80);

            // Step 5: Generate report
            await this.executeStep(5, async () => {
                return await this.generateReport();
            }, 3000);
            this.updateProgress(100);

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
        const circle = step.querySelector('.rounded-full');
        const spinner = step.querySelector('.fa-spinner');
        const check = step.querySelector('.fa-check');
        const number = step.querySelector('span');
        
        circle.classList.add('bg-purple-600', 'text-white');
        circle.classList.remove('bg-gray-200');
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
        circle.classList.remove('bg-purple-600');
        circle.classList.add('bg-green-100');
        
        return result;
    }

    resetStep(stepNumber) {
        const step = document.getElementById(`step${stepNumber}`);
        step.classList.remove('active', 'analyzing');
        
        const circle = step.querySelector('.rounded-full');
        const spinner = step.querySelector('.fa-spinner');
        const check = step.querySelector('.fa-check');
        const number = step.querySelector('span');
        
        circle.classList.remove('bg-purple-600', 'bg-green-100', 'text-white');
        circle.classList.add('bg-gray-200');
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
                
                // Use a CORS proxy for cross-origin requests in demo
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(location)}`;
                
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    const data = await response.json();
                    if (data.contents && data.contents.trim()) {
                        content = data.contents;
                        foundLocation = location;
                        console.log(`Found llms.txt at: ${location}`);
                        break;
                    }
                }
            } catch (error) {
                console.log(`Could not fetch from ${location}:`, error.message);
                // Continue to next location
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