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
            await this.executeStep(1, async () => {
                return await this.fetchLLMsTxt();
            }, 3000);
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
        // Simulate fetching llms.txt with realistic results
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    found: Math.random() > 0.3, // 70% chance of finding it
                    locations: ['/llms.txt', '/.well-known/llms.txt'],
                    content: `# AI Instructions for ${this.websiteUrl}\n\n## Authentication\nUse Bearer token authentication...\n\n## Endpoints\nGET /api/v1/data\nPOST /api/v1/create`
                });
            }, 500);
        });
    }

    async analyzeLLMsTxtContent() {
        // Simulate AI-powered content analysis
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    clarity: 75 + Math.random() * 20,
                    completeness: 65 + Math.random() * 25,
                    aiReadability: 80 + Math.random() * 15,
                    examples: 60 + Math.random() * 30,
                    authentication: 85 + Math.random() * 10,
                    endpoints: 70 + Math.random() * 20,
                    sections: {
                        authentication: true,
                        endpoints: true,
                        examples: Math.random() > 0.4,
                        rate_limits: Math.random() > 0.6,
                        error_handling: Math.random() > 0.5
                    },
                    aiCompatibility: {
                        claude: 0.85 + Math.random() * 0.15,
                        gpt4: 0.8 + Math.random() * 0.2,
                        general: 0.75 + Math.random() * 0.25
                    }
                });
            }, 800);
        });
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