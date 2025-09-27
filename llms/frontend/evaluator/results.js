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
            ],
            grade: 'B+'
        };
    }

    displayResults() {
        // Update page title and URL
        document.getElementById('websiteUrl').textContent = this.results.url;
        document.getElementById('reportDate').textContent = new Date(this.results.timestamp).toLocaleDateString();

        // Display overall score with animation
        this.animateScore(this.results.overallScore);
        
        // Display grade
        this.displayGrade(this.results.grade);
        
        // Display component scores
        this.displayComponentScores();
        
        // Display technical details
        this.displayTechnicalDetails();
        
        // Display AI compatibility
        this.displayAICompatibility();
        
        // Display generated llms.txt
        this.displayGeneratedLlmsTxt();
        
        // Display recommendations
        this.displayRecommendations();
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

    displayGrade(grade) {
        const gradeElement = document.getElementById('gradeText');
        const gradeBadge = document.getElementById('gradeBadge');
        
        gradeElement.textContent = grade;
        
        // Set grade color
        const gradeClass = grade.startsWith('A') ? 'grade-a' : 
                          grade.startsWith('B') ? 'grade-b' : 
                          grade.startsWith('C') ? 'grade-c' : 'grade-d';
        
        gradeBadge.className = `grade-badge ${gradeClass} text-white px-6 py-4 rounded-2xl text-center`;
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
        const details = this.results.details;
        
        const detailItems = [
            {
                icon: 'fas fa-file-alt',
                label: 'LLMs.txt File',
                value: details.llmsTxtFound ? 'Found' : 'Not Found',
                status: details.llmsTxtFound ? 'success' : 'warning'
            },
            {
                icon: 'fas fa-book',
                label: 'API Documentation',
                value: details.apiDocsFound ? 'Available' : 'Missing',
                status: details.apiDocsFound ? 'success' : 'warning'
            },
            {
                icon: 'fas fa-link',
                label: 'Endpoints Tested',
                value: `${details.successfulTests}/${details.endpointsTested}`,
                status: (details.successfulTests / details.endpointsTested) > 0.7 ? 'success' : 'warning'
            },
            {
                icon: 'fas fa-globe',
                label: 'CORS Enabled',
                value: details.corsEnabled ? 'Yes' : 'No',
                status: details.corsEnabled ? 'success' : 'warning'
            },
            {
                icon: 'fas fa-lock',
                label: 'HTTPS Only',
                value: details.httpsOnly ? 'Yes' : 'No',
                status: details.httpsOnly ? 'success' : 'warning'
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

    displayAICompatibility() {
        const compatibilityContainer = document.getElementById('aiCompatibility');
        const compatibility = this.results.aiCompatibility;
        
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

    displayGeneratedLlmsTxt() {
        const generatedContainer = document.getElementById('generatedLlmsTxt');
        
        if (this.results.generatedLlmsTxt) {
            generatedContainer.textContent = this.results.generatedLlmsTxt;
        } else {
            // Generate fallback content if not available
            const fallbackContent = this.generateFallbackLlmsTxt();
            generatedContainer.textContent = fallbackContent;
        }
    }

    generateFallbackLlmsTxt() {
        const url = this.results.url;
        const domain = new URL(`https://${url}`).hostname.replace('www.', '');
        const companyName = domain.split('.')[0];
        const currentDate = new Date().toISOString().split('T')[0];
        
        return `# Company: ${companyName}
# Updated: ${currentDate}
# Generated by DevMCP.ai llms.txt Evaluator

title: ${companyName} API
description: ${companyName} provides developer APIs and tools for building applications.

# Core Capabilities
capabilities:
  - api
  - web services
  - developer tools

# Integration Information
base_url: https://${url}
response_format: JSON
https_only: ${url.startsWith('https')}

# Authentication
auth_methods: [api_key, bearer_token]
auth_location: header

# Use Cases
use_cases:
  - scenario: "Access ${companyName} API endpoints"
    example: "GET /api/v1/status"

# Keywords for AI Discovery
keywords: [api, ${companyName.toLowerCase()}, web services]

# Contact
website: https://${url}
support: support@${domain}`;
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

function copyGeneratedLlmsTxt() {
    const generatedContent = document.getElementById('generatedLlmsTxt').textContent;
    
    // Copy to clipboard
    navigator.clipboard.writeText(generatedContent).then(() => {
        // Show success feedback
        const button = event.target.closest('button');
        const originalContent = button.innerHTML;
        
        button.innerHTML = '<i class="fas fa-check"></i> Copied!';
        button.classList.remove('bg-purple-600', 'hover:bg-purple-700');
        button.classList.add('bg-green-600');
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('bg-green-600');
            button.classList.add('bg-purple-600', 'hover:bg-purple-700');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        
        // Fallback: Select the text
        const range = document.createRange();
        range.selectNode(document.getElementById('generatedLlmsTxt'));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        
        alert('Content selected. Please copy manually with Ctrl+C (Cmd+C on Mac)');
    });
}

// Initialize results display when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ResultsDisplay();
});