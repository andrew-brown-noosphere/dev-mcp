// llms.txt Metrics Tracking System

class LLMsMetricsTracker {
    constructor(apiKey, domain) {
        this.apiKey = apiKey;
        this.domain = domain;
        this.metricsEndpoint = 'https://api.devmcp.ai/v1/llms-metrics';
    }

    // Generate tracking beacon for llms.txt
    generateBeacon() {
        const beaconId = this.generateBeaconId();
        
        return `
# Analytics Beacon (Do not remove - helps track AI adoption)
# beacon: ${this.metricsEndpoint}/beacon/${beaconId}
`;
    }

    // Generate unique beacon ID
    generateBeaconId() {
        return `${this.domain.replace(/\./g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Track discovery event
    async trackDiscovery(beaconId, request) {
        const event = {
            beacon_id: beaconId,
            timestamp: new Date().toISOString(),
            user_agent: request.headers['user-agent'],
            referer: request.headers['referer'],
            ip_country: await this.getCountry(request.ip),
            ai_agent: this.identifyAIAgent(request.headers['user-agent'])
        };

        await this.sendMetrics('discovery', event);
    }

    // Track API usage from llms.txt
    async trackAPIUsage(apiKey, endpoint, params) {
        const event = {
            api_key_hash: this.hashAPIKey(apiKey),
            endpoint: endpoint,
            timestamp: new Date().toISOString(),
            params_summary: this.summarizeParams(params),
            response_time_ms: params.responseTime,
            success: params.success,
            error_code: params.errorCode
        };

        await this.sendMetrics('api_usage', event);
    }

    // Identify which AI agent is accessing
    identifyAIAgent(userAgent) {
        const agents = {
            'Claude-Web': 'claude',
            'ChatGPT': 'chatgpt',
            'GPT-4': 'gpt4',
            'Gemini': 'gemini',
            'Copilot': 'github-copilot',
            'Cursor': 'cursor',
            'Cody': 'sourcegraph-cody'
        };

        for (const [key, value] of Object.entries(agents)) {
            if (userAgent.includes(key)) {
                return value;
            }
        }

        return 'unknown';
    }

    // Send metrics to DevMCP analytics
    async sendMetrics(eventType, data) {
        try {
            await fetch(this.metricsEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': this.apiKey
                },
                body: JSON.stringify({
                    event_type: eventType,
                    domain: this.domain,
                    data: data
                })
            });
        } catch (error) {
            console.error('Failed to send metrics:', error);
        }
    }

    // Helper methods
    hashAPIKey(apiKey) {
        // Simple hash for privacy
        return apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
    }

    summarizeParams(params) {
        // Summarize without exposing sensitive data
        return {
            param_count: Object.keys(params).length,
            has_filters: !!params.filters,
            has_pagination: !!params.limit || !!params.offset
        };
    }

    async getCountry(ip) {
        // In production, use GeoIP service
        return 'US'; // Placeholder
    }
}

// Metrics Dashboard Data Structure
class LLMsMetricsDashboard {
    constructor(domain) {
        this.domain = domain;
    }

    async getMetricsSummary() {
        return {
            discovery: {
                total_discoveries: 1247,
                unique_ai_agents: 7,
                discovery_trend: [
                    { date: '2025-01-21', count: 145 },
                    { date: '2025-01-22', count: 168 },
                    { date: '2025-01-23', count: 201 },
                    { date: '2025-01-24', count: 189 },
                    { date: '2025-01-25', count: 223 },
                    { date: '2025-01-26', count: 195 },
                    { date: '2025-01-27', count: 126 }
                ],
                ai_agent_breakdown: {
                    claude: 45,
                    gpt4: 28,
                    chatgpt: 15,
                    cursor: 8,
                    copilot: 4
                }
            },
            usage: {
                api_calls_from_ai: 3842,
                successful_integrations: 89,
                avg_time_to_integration: '4.2 hours',
                popular_endpoints: [
                    { endpoint: '/api/v1/query', calls: 1523 },
                    { endpoint: '/api/v1/auth', calls: 892 },
                    { endpoint: '/api/v1/data', calls: 674 }
                ]
            },
            performance: {
                ai_adoption_score: 78,
                discovery_rate: '14.3 per day',
                implementation_rate: '7.1%',
                error_rate: '2.3%'
            },
            insights: [
                {
                    type: 'success',
                    message: 'Claude agents have 94% success rate with your API'
                },
                {
                    type: 'warning',
                    message: 'GPT-4 agents failing auth - consider adding OAuth examples'
                },
                {
                    type: 'info',
                    message: 'Peak discovery time is 2-4 PM PST'
                }
            ]
        };
    }
}

// Export for use
export { LLMsMetricsTracker, LLMsMetricsDashboard };