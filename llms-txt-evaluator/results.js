// Results Page Logic

class ResultsDisplay {
    constructor() {
        this.results = null;
        this.init();
    }

    init() {
        // Get results from localStorage or generate demo data
        const storedResults = localStorage.getItem('evaluationResults');
        if (storedResults) {
            this.results = JSON.parse(storedResults);
        } else {
            // Generate demo results for direct access
            this.results = this.generateDemoResults();
        }

        this.displayResults();
        this.setupEventListeners();
    }

    generateDemoResults() {
        const urlParams = new URLSearchParams(window.location.search);
        const url = urlParams.get('url') || 'example.com';
        
        return {
            url: url,
            timestamp: new Date().toISOString(),
            overallScore: 78,
            scores: {
                clarity: 82,
                completeness: 74,
                aiReadability: 85,
                examples: 69,
                authentication: 81,
                endpoints: 77
            },
            details: {
                llmsTxtFound: true,
                apiDocsFound: true,
                endpointsTested: 7,
                successfulTests: 5,
                corsEnabled: true,
                httpsOnly: true
            },
            aiCompatibility: {
                claude: 0.87,
                gpt4: 0.82,
                general: 0.79
            },
            recommendations: [
                {
                    priority: 'high',
                    category: 'Examples',
                    title: 'Add more comprehensive code examples',
                    description: 'Your API documentation would benefit from more detailed code examples for each endpoint. AI agents learn better from concrete examples.'
                },
                {
                    priority: 'medium',
                    category: 'Documentation',
                    title: 'Improve error handling documentation',
                    description: 'Add clear documentation about error responses, status codes, and how to handle different error scenarios.'
                },
                {
                    priority: 'medium',
                    category: 'Technical',
                    title: 'Add rate limiting information',
                    description: 'Include information about rate limits, throttling policies, and best practices for API usage.'
                },
                {
                    priority: 'low',
                    category: 'Standards',
                    title: 'Consider adding OpenAPI specification',
                    description: 'An OpenAPI (Swagger) specification would make your API more machine-readable and improve AI agent compatibility.'
                }
            ]
        };
    }

    displayResults() {
        // Update page title and URL
        document.getElementById('websiteUrl').textContent = this.results.domain || this.results.url;
        document.getElementById('reportDate').textContent = new Date(this.results.timestamp).toLocaleDateString();

        // Show badge if testing generated content
        if (this.results.generatedContent) {
            this.showGeneratedContentBadge();
        }

        // Check if llms.txt was found
        if (!this.results.llmsTxtFound || this.results.overallScore === 0) {
            this.displayNoLlmsTxtMessage();
            return;
        }

        // Display overall score with animation
        this.animateScore(this.results.overallScore);
        
        // Display percentage score
        this.displayPercentageScore(this.results.overallScore);
        
        // Display component scores
        this.displayComponentScores();
        
        // Display technical details
        this.displayTechnicalDetails();
        
        // Display AI compatibility
        this.displayAICompatibility();
        
        // Display recommendations
        this.displayRecommendations();
    }

    showGeneratedContentBadge() {
        // Add a badge and deployment instructions
        const headerSection = document.querySelector('.text-center.mb-8');
        if (headerSection) {
            const badge = document.createElement('div');
            badge.className = 'bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left max-w-3xl mx-auto';
            badge.innerHTML = `
                <div class="flex items-start">
                    <i class="fas fa-flask text-blue-500 mr-3 mt-1"></i>
                    <div class="flex-1">
                        <h4 class="font-semibold text-blue-900 mb-1">Testing Pre-Deployment llms.txt</h4>
                        <p class="text-blue-700 text-sm mb-2">
                            This evaluation is based on the llms.txt content you generated. 
                            The file hasn't been deployed to <code class="bg-blue-100 px-1 rounded">${this.results.domain}</code> yet.
                        </p>
                        <div class="bg-white border border-blue-100 rounded p-3 mt-2">
                            <p class="text-sm font-medium text-gray-700 mb-1">Next Steps:</p>
                            <ol class="text-sm text-gray-600 list-decimal list-inside">
                                <li>Review the evaluation results below</li>
                                <li>Make any recommended improvements</li>
                                <li>Deploy the file to: <code class="bg-gray-100 px-1 rounded">https://${this.results.domain}/llms.txt</code></li>
                                <li>Run the evaluator again to test the live deployment</li>
                            </ol>
                        </div>
                    </div>
                </div>
            `;
            headerSection.insertBefore(badge, headerSection.firstChild);
        }
        
        // Add "Back to Generator" button to the action buttons section
        const buttonContainer = document.querySelector('.flex.flex-col.sm\\:flex-row.gap-4.justify-center');
        if (buttonContainer) {
            const backButton = document.createElement('a');
            backButton.href = `/llms-generator.html?url=${encodeURIComponent(this.results.domain)}`;
            backButton.className = 'border border-blue-600 text-blue-600 font-semibold py-3 px-8 rounded-lg hover:bg-blue-50 transition';
            backButton.innerHTML = `
                <i class="fas fa-arrow-left mr-2"></i>
                Back to Generator
            `;
            buttonContainer.insertBefore(backButton, buttonContainer.firstChild);
        }
    }

    displayNoLlmsTxtMessage() {
        // Update the main container to show the missing llms.txt message
        const mainContainer = document.querySelector('.max-w-6xl');
        if (!mainContainer) return;
        
        mainContainer.innerHTML = `
            <div class="bg-white rounded-2xl shadow-xl p-8 text-center">
                <div class="mb-6 relative">
                    <div class="inline-block relative">
                        <i class="fas fa-file-slash text-6xl text-red-500"></i>
                        <div class="absolute -bottom-2 -right-2 bg-red-500 text-white rounded-full w-20 h-20 flex items-center justify-center font-bold text-2xl">
                            0%
                        </div>
                    </div>
                </div>
                <h1 class="text-3xl font-bold mb-4">No llms.txt File Found</h1>
                <p class="text-xl text-gray-600 mb-8">
                    This site scores 0% for AI readiness because it lacks an llms.txt file.
                </p>
                
                <div class="bg-gray-50 rounded-lg p-6 mb-8 text-left max-w-2xl mx-auto">
                    <h3 class="text-lg font-semibold mb-3">What is llms.txt?</h3>
                    <p class="text-gray-600 mb-4">
                        An llms.txt file is a standardized way to make your APIs discoverable and usable by AI agents like Claude, GPT-4, and others. 
                        It provides structured information about your API endpoints, authentication methods, and usage examples.
                    </p>
                    <h3 class="text-lg font-semibold mb-3">Why do you need it?</h3>
                    <p class="text-gray-600">
                        As AI becomes more integrated into development workflows, having an llms.txt file ensures your APIs can be automatically 
                        discovered, understood, and integrated by AI coding assistants. This dramatically improves developer experience and adoption.
                    </p>
                </div>
                
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/llms-generator.html" class="gradient-bg text-white font-semibold py-3 px-8 rounded-lg hover:opacity-90 transition">
                        <i class="fas fa-wand-magic-sparkles mr-2"></i>
                        Generate llms.txt
                    </a>
                    <a href="/blog/llms-txt-your-ai-discovery-file.html" class="border border-purple-600 text-purple-600 font-semibold py-3 px-8 rounded-lg hover:bg-purple-50 transition">
                        <i class="fas fa-book mr-2"></i>
                        Learn More
                    </a>
                </div>
            </div>
        `;
    }

    animateScore(score) {
        const scoreElement = document.getElementById('overallScore');
        const scoreCircle = document.querySelector('.score-fill');
        
        // Calculate circle stroke offset
        const circumference = 283; // 2 * π * radius (45)
        const offset = circumference - (score / 100) * circumference;
        
        // Set CSS custom property for animation
        scoreCircle.style.setProperty('--score-offset', offset);
        
        // Animate the number
        let currentScore = 0;
        const increment = score / 60; // 60 frames for smooth animation
        
        const animate = () => {
            currentScore += increment;
            if (currentScore >= score) {
                scoreElement.textContent = score;
                return;
            }
            scoreElement.textContent = Math.round(currentScore);
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    displayPercentageScore(score) {
        const scoreElement = document.getElementById('scorePercentText');
        const scoreBadge = document.getElementById('scoreBadge');
        
        scoreElement.textContent = `${score}%`;
        
        // Set score color based on percentage
        let scoreClass = '';
        if (score >= 80) scoreClass = 'excellent';
        else if (score >= 60) scoreClass = 'good';
        else if (score >= 40) scoreClass = 'fair';
        else scoreClass = 'poor';
        
        scoreBadge.className = `score-badge ${scoreClass} text-white px-6 py-4 rounded-2xl text-center`;
    }

    displayComponentScores() {
        const components = ['clarity', 'completeness', 'aiReadability', 'examples', 'authentication', 'endpoints'];
        
        components.forEach(component => {
            const score = this.results.scores[component];
            const scoreElement = document.getElementById(`${component}Score`);
            const barElement = document.getElementById(`${component}Bar`);
            
            if (scoreElement && barElement) {
                // Animate score number
                let currentScore = 0;
                const increment = score / 40;
                
                const animateScore = () => {
                    currentScore += increment;
                    if (currentScore >= score) {
                        scoreElement.textContent = score;
                        return;
                    }
                    scoreElement.textContent = Math.round(currentScore);
                    requestAnimationFrame(animateScore);
                };
                
                // Animate progress bar
                setTimeout(() => {
                    barElement.style.width = `${score}%`;
                    requestAnimationFrame(animateScore);
                }, 500);
            }
        });
    }

    displayTechnicalDetails() {
        const detailsContainer = document.getElementById('technicalDetails');
        if (!detailsContainer) return;
        
        // Check for new API response structure
        if (this.results.details && this.results.details.sections) {
            const sections = this.results.details.sections;
            const detailItems = [
                {
                    icon: 'fas fa-file-alt',
                    label: 'LLMs.txt File',
                    value: this.results.generatedContent ? 'Generated (Not Deployed)' : 
                           (this.results.llmsTxtFound ? 'Found' : 'Not Found'),
                    status: this.results.llmsTxtFound ? 'success' : 'warning'
                },
                {
                    icon: 'fas fa-key',
                    label: 'Authentication Docs',
                    value: sections.authentication ? 'Present' : 'Missing',
                    status: sections.authentication ? 'success' : 'warning'
                },
                {
                    icon: 'fas fa-link',
                    label: 'API Endpoints',
                    value: sections.endpoints ? 'Documented' : 'Missing',
                    status: sections.endpoints ? 'success' : 'warning'
                },
                {
                    icon: 'fas fa-code',
                    label: 'Code Examples',
                    value: sections.examples ? 'Available' : 'Missing',
                    status: sections.examples ? 'success' : 'warning'
                },
                {
                    icon: 'fas fa-tachometer-alt',
                    label: 'Rate Limits',
                    value: sections.rate_limits ? 'Documented' : 'Missing',
                    status: sections.rate_limits ? 'success' : 'warning'
                }
            ];

            detailsContainer.innerHTML = detailItems.map(item => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center">
                        <i class="${item.icon} mr-3 text-gray-600"></i>
                        <span class="font-medium">${item.label}</span>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }">
                        ${item.value}
                    </span>
                </div>
            `).join('');
        } else {
            // Fallback for old structure
            const details = this.results.details;
            const detailItems = [
                {
                    icon: 'fas fa-file-alt',
                    label: 'LLMs.txt File',
                    value: details.llmsTxtFound ? 'Found' : 'Not Found',
                    status: details.llmsTxtFound ? 'success' : 'warning'
                }
            ];

            detailsContainer.innerHTML = detailItems.map(item => `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center">
                        <i class="${item.icon} mr-3 text-gray-600"></i>
                        <span class="font-medium">${item.label}</span>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }">
                        ${item.value}
                    </span>
                </div>
            `).join('');
        }
    }

    displayAICompatibility() {
        const compatibilityContainer = document.getElementById('aiCompatibility');
        if (!compatibilityContainer) return;
        
        // Check for compatibility data in details.aiCompatibility
        const compatibility = this.results.details?.aiCompatibility || this.results.aiCompatibility;
        
        if (!compatibility) {
            compatibilityContainer.innerHTML = '<p class="text-gray-600">Compatibility data not available</p>';
            return;
        }
        
        const aiAgents = [
            { name: 'Claude', key: 'claude', icon: 'fas fa-brain', color: 'purple' },
            { name: 'GPT-4', key: 'gpt4', icon: 'fas fa-robot', color: 'green' },
            { name: 'General AI', key: 'general', icon: 'fas fa-microchip', color: 'blue' }
        ];

        compatibilityContainer.innerHTML = aiAgents.map(agent => {
            const score = Math.round(compatibility[agent.key] * 100);
            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center">
                        <i class="${agent.icon} mr-3 text-${agent.color}-600"></i>
                        <span class="font-medium">${agent.name}</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-24 bg-gray-200 rounded-full h-2 mr-3">
                            <div class="h-2 rounded-full bg-${agent.color}-500" style="width: ${score}%"></div>
                        </div>
                        <span class="font-bold text-${agent.color}-600">${score}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    displayRecommendations() {
        const recommendationsContainer = document.getElementById('recommendations');
        const recommendations = this.results.recommendations;
        
        if (!recommendations || recommendations.length === 0) {
            recommendationsContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-check-circle text-4xl mb-4"></i>
                    <p>Great job! No major recommendations at this time.</p>
                </div>
            `;
            return;
        }

        recommendationsContainer.innerHTML = recommendations.map((rec, index) => `
            <div class="recommendation-card priority-${rec.priority} bg-gray-50 rounded-lg p-6">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            rec.priority === 'high' ? 'bg-red-100' :
                            rec.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                        }">
                            <i class="fas ${
                                rec.priority === 'high' ? 'fa-exclamation text-red-600' :
                                rec.priority === 'medium' ? 'fa-clock text-yellow-600' : 'fa-info text-green-600'
                            }"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800">${rec.title}</h4>
                            <span class="text-xs px-2 py-1 rounded-full ${
                                rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                            }">
                                ${rec.category} • ${rec.priority.toUpperCase()} PRIORITY
                            </span>
                        </div>
                    </div>
                </div>
                <p class="text-gray-600 text-sm">${rec.description}</p>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Email form submission
        document.getElementById('emailForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.sendReport();
        });
    }

    async sendReport() {
        const email = document.getElementById('userEmail').value;
        
        try {
            // For demo purposes, we'll just show success
            console.log('Sending report to:', email);
            console.log('Results:', this.results);

            // Show success message
            this.hideEmailModal();
            this.showSuccessMessage();
            
        } catch (error) {
            console.error('Failed to send report:', error);
            alert('Failed to send report. Please try again.');
        }
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
                    Check your email for your detailed AI-readiness report PDF.
                </p>
                <button 
                    onclick="this.parentElement.parentElement.remove()"
                    class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2 px-6 rounded-lg"
                >
                    Continue
                </button>
            </div>
        `;
        document.body.appendChild(successDiv);
    }

    hideEmailModal() {
        document.getElementById('emailModal').classList.add('hidden');
        document.getElementById('emailModal').classList.remove('flex');
    }
}

// Global functions for button handlers
function showEmailModal() {
    const modal = document.getElementById('emailModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function hideEmailModal() {
    const modal = document.getElementById('emailModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Initialize results display when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ResultsDisplay();
});