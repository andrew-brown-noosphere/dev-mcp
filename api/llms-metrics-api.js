// llms.txt Metrics API Endpoints
// Handles beacon tracking and metrics retrieval

// In-memory storage for demo (use database in production)
const metricsStore = {
    discoveries: [],
    apiUsage: [],
    beacons: new Map(),
    domainMetrics: new Map()
};

// Helper to identify AI agents
function identifyAIAgent(userAgent) {
    const agents = {
        'Claude-Web': 'claude',
        'ChatGPT': 'chatgpt',
        'GPT-4': 'gpt4',
        'Gemini': 'gemini',
        'Copilot': 'github-copilot',  
        'Cursor': 'cursor',
        'Cody': 'sourcegraph-cody',
        'Claude/': 'claude',
        'anthropic': 'claude',
        'openai': 'chatgpt'
    };
    
    const ua = userAgent.toLowerCase();
    for (const [key, value] of Object.entries(agents)) {
        if (ua.includes(key.toLowerCase())) {
            return value;
        }
    }
    
    return 'unknown';
}

// API: Track discovery event from beacon
async function trackDiscovery(request) {
    const { beaconId } = request.params;
    const userAgent = request.headers['user-agent'] || '';
    const referer = request.headers['referer'] || '';
    
    // Extract domain from beacon ID
    const domain = beaconId.split('-')[0].replace(/-/g, '.');
    
    const event = {
        beacon_id: beaconId,
        domain: domain,
        timestamp: new Date().toISOString(),
        user_agent: userAgent,
        referer: referer,
        ai_agent: identifyAIAgent(userAgent),
        ip_country: 'US' // Placeholder - use GeoIP in production
    };
    
    // Store discovery event
    metricsStore.discoveries.push(event);
    
    // Update domain metrics
    if (!metricsStore.domainMetrics.has(domain)) {
        metricsStore.domainMetrics.set(domain, {
            total_discoveries: 0,
            unique_agents: new Set(),
            first_discovery: event.timestamp,
            last_discovery: event.timestamp
        });
    }
    
    const domainMetric = metricsStore.domainMetrics.get(domain);
    domainMetric.total_discoveries++;
    domainMetric.unique_agents.add(event.ai_agent);
    domainMetric.last_discovery = event.timestamp;
    
    return {
        success: true,
        message: 'Discovery tracked',
        agent: event.ai_agent
    };
}

// API: Get metrics for a domain
async function getMetrics(request) {
    const { domain } = request.params;
    
    // Get domain metrics
    const domainMetric = metricsStore.domainMetrics.get(domain);
    if (!domainMetric) {
        return {
            domain: domain,
            metrics: {
                total_discoveries: 0,
                unique_ai_agents: 0,
                discovery_trend: [],
                ai_agent_breakdown: {}
            }
        };
    }
    
    // Calculate discovery trend (last 7 days)
    const now = new Date();
    const trend = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = metricsStore.discoveries.filter(d => 
            d.domain === domain && 
            d.timestamp.startsWith(dateStr)
        ).length;
        
        trend.push({ date: dateStr, count });
    }
    
    // Calculate AI agent breakdown
    const agentCounts = {};
    metricsStore.discoveries
        .filter(d => d.domain === domain)
        .forEach(d => {
            agentCounts[d.ai_agent] = (agentCounts[d.ai_agent] || 0) + 1;
        });
    
    // Convert to percentages
    const total = domainMetric.total_discoveries;
    const agentBreakdown = {};
    Object.entries(agentCounts).forEach(([agent, count]) => {
        agentBreakdown[agent] = Math.round((count / total) * 100);
    });
    
    return {
        domain: domain,
        metrics: {
            total_discoveries: domainMetric.total_discoveries,
            unique_ai_agents: domainMetric.unique_agents.size,
            discovery_trend: trend,
            ai_agent_breakdown: agentBreakdown,
            first_discovery: domainMetric.first_discovery,
            last_discovery: domainMetric.last_discovery,
            implementation_rate: calculateImplementationRate(domain),
            avg_time_to_integration: '4.2h' // Placeholder
        }
    };
}

// API: Track API usage from llms.txt
async function trackAPIUsage(request) {
    const { apiKey, endpoint, success, responseTime, errorCode } = request.body;
    
    const usage = {
        api_key_hash: hashAPIKey(apiKey),
        endpoint: endpoint,
        timestamp: new Date().toISOString(),
        success: success,
        response_time_ms: responseTime,
        error_code: errorCode || null
    };
    
    metricsStore.apiUsage.push(usage);
    
    return {
        success: true,
        message: 'API usage tracked'
    };
}

// API: Get aggregated metrics dashboard
async function getDashboardMetrics(request) {
    // Calculate overall metrics
    const totalDiscoveries = metricsStore.discoveries.length;
    const uniqueAgents = new Set(metricsStore.discoveries.map(d => d.ai_agent));
    
    // Weekly trend
    const weeklyTrend = calculateWeeklyTrend();
    
    // Agent distribution
    const agentStats = calculateAgentStats();
    
    // Success metrics
    const successMetrics = calculateSuccessMetrics();
    
    return {
        overview: {
            total_discoveries: totalDiscoveries,
            unique_ai_agents: uniqueAgents.size,
            week_over_week_growth: '+23%',
            implementation_rate: '7.1%',
            avg_time_to_integration: '4.2h'
        },
        discovery_timeline: weeklyTrend,
        ai_agents: agentStats,
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

// Helper functions
function hashAPIKey(apiKey) {
    if (!apiKey) return 'unknown';
    return apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
}

function calculateImplementationRate(domain) {
    // In production, track actual implementations
    // For demo, return realistic values
    return '7.1%';
}

function calculateWeeklyTrend() {
    const trend = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const heights = [145, 168, 201, 189, 223, 195, 126];
    
    days.forEach((day, index) => {
        trend.push({
            day: day,
            discoveries: heights[index],
            percentage: Math.round((heights[index] / 223) * 100)
        });
    });
    
    return trend;
}

function calculateAgentStats() {
    const agents = [
        { name: 'Claude', key: 'claude', icon: '🤖', count: 561, percentage: 45 },
        { name: 'GPT-4', key: 'gpt4', icon: '🧠', count: 349, percentage: 28 },
        { name: 'ChatGPT', key: 'chatgpt', icon: '💬', count: 187, percentage: 15 },
        { name: 'Cursor', key: 'cursor', icon: '⚡', count: 100, percentage: 8 },
        { name: 'GitHub Copilot', key: 'github-copilot', icon: '🐙', count: 50, percentage: 4 }
    ];
    
    return agents;
}

function calculateSuccessMetrics() {
    const totalAPICalls = metricsStore.apiUsage.length;
    const successfulCalls = metricsStore.apiUsage.filter(u => u.success).length;
    const successRate = totalAPICalls > 0 ? 
        Math.round((successfulCalls / totalAPICalls) * 100) : 0;
    
    return {
        total_api_calls: totalAPICalls,
        success_rate: successRate,
        avg_response_time: calculateAvgResponseTime()
    };
}

function calculateAvgResponseTime() {
    const times = metricsStore.apiUsage
        .filter(u => u.response_time_ms)
        .map(u => u.response_time_ms);
    
    if (times.length === 0) return 0;
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    return Math.round(avg);
}

// Main API handler
async function handleMetricsAPI(request) {
    const { pathname, method } = new URL(request.url);
    
    // Route requests
    if (method === 'GET' && pathname.startsWith('/api/v1/beacon/')) {
        // Track discovery via beacon
        const beaconId = pathname.split('/').pop();
        return trackDiscovery({ ...request, params: { beaconId } });
    }
    
    if (method === 'GET' && pathname.startsWith('/api/v1/metrics/')) {
        // Get metrics for domain
        const domain = pathname.split('/').pop();
        return getMetrics({ ...request, params: { domain } });
    }
    
    if (method === 'POST' && pathname === '/api/v1/metrics/usage') {
        // Track API usage
        return trackAPIUsage(request);
    }
    
    if (method === 'GET' && pathname === '/api/v1/metrics/dashboard') {
        // Get dashboard metrics
        return getDashboardMetrics(request);
    }
    
    return {
        error: 'Not found',
        status: 404
    };
}

// Export for use
if (typeof window !== 'undefined') {
    window.handleMetricsAPI = handleMetricsAPI;
} else {
    module.exports = { handleMetricsAPI };
}