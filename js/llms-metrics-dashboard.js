// llms.txt Metrics Dashboard Interactive JS

class MetricsDashboard {
    constructor() {
        this.apiEndpoint = '/api/llms-metrics-api.js';
        this.refreshInterval = null;
        this.init();
    }

    async init() {
        // Load API handler if not already loaded
        if (!window.handleMetricsAPI) {
            await this.loadAPIHandler();
        }
        
        // Load initial metrics
        await this.loadDashboardMetrics();
        
        // Set up auto-refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.loadDashboardMetrics();
        }, 30000);
        
        // Set up event listeners
        this.setupEventListeners();
    }

    async loadAPIHandler() {
        const script = document.createElement('script');
        script.src = this.apiEndpoint;
        document.head.appendChild(script);
        
        return new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
        });
    }

    async loadDashboardMetrics() {
        try {
            // Simulate API request for demo
            const request = {
                url: '/api/v1/metrics/dashboard',
                method: 'GET'
            };
            
            const metrics = await window.handleMetricsAPI(request);
            this.updateDashboard(metrics);
        } catch (error) {
            console.error('Failed to load metrics:', error);
        }
    }

    updateDashboard(metrics) {
        // Update key metrics
        this.updateKeyMetrics(metrics.overview);
        
        // Update AI agents breakdown
        this.updateAgentBreakdown(metrics.ai_agents);
        
        // Update discovery timeline
        this.updateTimeline(metrics.discovery_timeline);
        
        // Update insights
        this.updateInsights(metrics.insights);
    }

    updateKeyMetrics(overview) {
        // Total discoveries
        const discoveriesEl = document.querySelector('.metric-value');
        if (discoveriesEl) {
            this.animateNumber(discoveriesEl, overview.total_discoveries);
        }
        
        // Update other metrics
        const metrics = [
            { selector: '.metrics-grid .metric-card:nth-child(1) .metric-value', 
              value: overview.total_discoveries },
            { selector: '.metrics-grid .metric-card:nth-child(2) .metric-value', 
              value: overview.unique_ai_agents },
            { selector: '.metrics-grid .metric-card:nth-child(3) .metric-value', 
              value: overview.implementation_rate },
            { selector: '.metrics-grid .metric-card:nth-child(4) .metric-value', 
              value: overview.avg_time_to_integration }
        ];
        
        metrics.forEach(metric => {
            const el = document.querySelector(metric.selector);
            if (el) {
                el.textContent = metric.value;
            }
        });
    }

    updateAgentBreakdown(agents) {
        const container = document.querySelector('.agent-list');
        if (!container) return;
        
        container.innerHTML = agents.map(agent => `
            <div class="agent-item">
                <div class="agent-info">
                    <div class="agent-icon">${agent.icon}</div>
                    <div>
                        <div style="font-weight: 600;">${agent.name}</div>
                        <div style="font-size: 0.875rem; color: rgba(255, 255, 255, 0.6);">
                            ${agent.key === 'claude' ? 'Anthropic' : 
                              agent.key.includes('gpt') || agent.key === 'chatgpt' ? 'OpenAI' : 
                              'AI Tool'}
                        </div>
                    </div>
                </div>
                <div class="agent-stats">
                    <div class="agent-count">${agent.count}</div>
                    <div style="font-size: 0.75rem; color: rgba(255, 255, 255, 0.6);">
                        ${agent.percentage}% of total
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateTimeline(timeline) {
        const container = document.querySelector('.chart-container:nth-child(2) > div:last-child');
        if (!container) return;
        
        const maxHeight = Math.max(...timeline.map(d => d.discoveries));
        
        container.innerHTML = `
            <div style="height: 200px; display: flex; align-items: flex-end; justify-content: space-between; padding: 0 1rem;">
                ${timeline.map(day => `
                    <div style="flex: 1; margin: 0 4px;">
                        <div style="background: linear-gradient(to top, #7850ff, #ff5078); 
                                    height: ${(day.discoveries / maxHeight) * 180}px; 
                                    border-radius: 4px 4px 0 0;
                                    transition: height 0.5s ease;"></div>
                        <div style="text-align: center; margin-top: 0.5rem; font-size: 0.75rem; 
                                    color: rgba(255, 255, 255, 0.6);">${day.day}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    updateInsights(insights) {
        const container = document.querySelector('.chart-container:last-child');
        if (!container) return;
        
        const insightsHTML = insights.map(insight => `
            <div class="insight-card insight-${insight.type}">
                <i class="fas ${
                    insight.type === 'success' ? 'fa-check-circle' :
                    insight.type === 'warning' ? 'fa-exclamation-triangle' : 
                    'fa-info-circle'
                }" style="color: ${
                    insight.type === 'success' ? '#10b981' :
                    insight.type === 'warning' ? '#f59e0b' : '#3b82f6'
                };"></i>
                <div>${insight.message}</div>
            </div>
        `).join('');
        
        // Update insights section
        const insightsSection = container.querySelector('h3');
        if (insightsSection && insightsSection.nextSibling) {
            container.innerHTML = `
                <h3 class="chart-title">AI Integration Insights</h3>
                ${insightsHTML}
            `;
        }
    }

    animateNumber(element, target) {
        const current = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
        const increment = (target - current) / 30;
        let value = current;
        
        const animate = () => {
            value += increment;
            if ((increment > 0 && value >= target) || (increment < 0 && value <= target)) {
                element.textContent = target.toLocaleString();
                return;
            }
            element.textContent = Math.round(value).toLocaleString();
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    setupEventListeners() {
        // Copy beacon code button
        const beaconCode = document.querySelector('.code-block:first-of-type');
        if (beaconCode) {
            beaconCode.style.cursor = 'pointer';
            beaconCode.addEventListener('click', () => {
                this.copyBeaconCode();
            });
        }
        
        // Generate custom beacon
        const docsBtn = document.querySelector('.btn[href="/docs/llms-metrics"]');
        if (docsBtn) {
            docsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showBeaconGenerator();
            });
        }
    }

    copyBeaconCode() {
        const domain = prompt('Enter your domain (e.g., example.com):');
        if (!domain) return;
        
        const beaconId = `${domain.replace(/\./g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const beaconCode = `# Your existing llms.txt content...

# Analytics Beacon (Do not remove - tracks AI adoption)
# beacon: https://api.devmcp.ai/v1/beacon/${beaconId}`;
        
        navigator.clipboard.writeText(beaconCode).then(() => {
            this.showNotification('Beacon code copied! Add it to your llms.txt file.');
        });
    }

    showBeaconGenerator() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-lg mx-4">
                <h2 class="text-2xl font-bold mb-4">Generate Your Tracking Beacon</h2>
                <p class="text-gray-400 mb-4">
                    Enter your domain to generate a unique tracking beacon for your llms.txt file.
                </p>
                <input type="text" 
                       id="domainInput" 
                       placeholder="example.com"
                       class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                              text-white mb-4 focus:outline-none focus:border-purple-500">
                <div class="flex gap-4">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            class="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
                        Cancel
                    </button>
                    <button id="generateBtn" 
                            class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        Generate Beacon
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('generateBtn').addEventListener('click', () => {
            const domain = document.getElementById('domainInput').value;
            if (domain) {
                modal.remove();
                this.generateAndCopyBeacon(domain);
            }
        });
    }

    generateAndCopyBeacon(domain) {
        const beaconId = `${domain.replace(/\./g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const beaconCode = `# Analytics Beacon (Do not remove - tracks AI adoption)
# beacon: https://api.devmcp.ai/v1/beacon/${beaconId}`;
        
        navigator.clipboard.writeText(beaconCode).then(() => {
            this.showNotification(`Beacon generated for ${domain} and copied to clipboard!`);
        });
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transition = 'opacity 0.5s';
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.metricsDashboard = new MetricsDashboard();
});