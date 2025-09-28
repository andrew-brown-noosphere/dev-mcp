# llms.txt Metrics Guide

Track how AI agents discover and use your APIs through llms.txt analytics.

## Overview

The llms.txt metrics system provides real-time insights into:
- Which AI agents are discovering your API
- How they're using your endpoints
- Success rates and integration patterns
- Time from discovery to implementation

## Quick Start

### 1. Add Tracking Beacon to Your llms.txt

Add this beacon to the bottom of your llms.txt file:

```
# Analytics Beacon (Do not remove - tracks AI adoption)
# beacon: https://api.devmcp.ai/v1/beacon/your-domain-com-[unique-id]
```

### 2. Install the SDK (Optional)

For detailed tracking, install our Node.js SDK:

```bash
npm install @devmcp/llms-metrics
```

### 3. Track API Usage

```javascript
import { LLMsMetricsTracker } from '@devmcp/llms-metrics';

const tracker = new LLMsMetricsTracker(
    process.env.DEVMCP_API_KEY,
    'your-domain.com'
);

// Track API calls
await tracker.trackAPIUsage(apiKey, endpoint, {
    success: true,
    responseTime: 142
});
```

## Metrics Dashboard

View your metrics at: https://devmcp.ai/llms-metrics

### Key Metrics

**Total AI Discoveries**
- How many times AI agents have accessed your llms.txt file
- Tracks unique discovery events

**Unique AI Agents**  
- Which AI tools are discovering your API
- Claude, GPT-4, ChatGPT, Cursor, GitHub Copilot, etc.

**Implementation Rate**
- Percentage of discoveries that lead to actual API usage
- Helps measure conversion effectiveness

**Time to Integration**
- Average time from discovery to first successful API call
- Indicates how easy your API is to implement

### Discovery Timeline

Visual representation of when AI agents discover your API:
- Daily/weekly trends
- Peak discovery times
- Growth patterns

### AI Agent Breakdown

See which AI agents are most interested in your API:
- Percentage breakdown by agent
- Success rates per agent
- Integration patterns

## Integration Patterns

### Basic Beacon (Minimal Tracking)

Just add the beacon comment to your llms.txt:

```
# beacon: https://api.devmcp.ai/v1/beacon/your-unique-id
```

This tracks:
- Discovery events
- User agents
- Basic analytics

### SDK Integration (Full Tracking)

Use the SDK for detailed metrics:

```javascript
// Initialize tracker
const tracker = new LLMsMetricsTracker(apiKey, domain);

// Generate beacon for llms.txt
const beacon = tracker.generateBeacon();

// Track API usage
app.use(async (req, res, next) => {
    if (isAIAgent(req.headers['user-agent'])) {
        await tracker.trackAPIUsage(
            req.headers.authorization,
            req.path,
            { success: true, responseTime: Date.now() - start }
        );
    }
    next();
});
```

### Express Middleware

```javascript
import { llmsMetricsMiddleware } from '@devmcp/llms-metrics';

app.use(llmsMetricsMiddleware({
    apiKey: process.env.DEVMCP_API_KEY,
    domain: 'your-domain.com'
}));
```

## Understanding Your Metrics

### Discovery vs Implementation

**High Discovery, Low Implementation**
- Your API is being found but not used
- Review your examples and documentation
- Consider simplifying authentication

**Consistent Implementation Rate**
- AI agents successfully integrate
- Your documentation is effective
- Monitor for optimization opportunities

### Agent-Specific Insights

Different AI agents have different strengths:

**Claude**: Excels at understanding complex APIs
- Provide detailed examples
- Include context about use cases

**GPT-4**: Strong at code generation
- Clear endpoint documentation
- Include error handling examples

**Cursor/Copilot**: Used for implementation
- Provide code snippets
- Include common patterns

## Best Practices

### 1. Beacon Placement
- Place at the end of your llms.txt
- Don't modify the beacon URL
- Keep the comment intact

### 2. Privacy Considerations
- We don't track sensitive data
- API keys are hashed
- No request/response bodies stored

### 3. Using Insights

**Optimize for AI Discovery**
- Add examples that failed agents struggle with
- Improve documentation based on error patterns
- A/B test different llms.txt formats

**Track Implementation Success**
- Monitor which examples get used most
- Identify confusing endpoints
- Improve based on failure patterns

## Advanced Features

### Session Tracking

Track complete AI implementation sessions:

```javascript
const session = tracker.startSession({
    agent: 'claude',
    intent: 'implement_auth'
});

// Track multiple API calls in session
await session.trackCall('/v1/auth', { success: true });
await session.trackCall('/v1/users', { success: true });

// Complete session
await session.complete();
```

### Custom Events

Track specific implementation milestones:

```javascript
tracker.trackEvent('first_successful_query', {
    endpoint: '/v1/query',
    query_type: 'select'
});
```

### Webhooks

Get notified of significant events:

```javascript
tracker.addWebhook('https://your-api.com/llms-webhook', {
    events: ['new_agent', 'implementation_success'],
    minThreshold: 10
});
```

## FAQ

**Q: Does this slow down my API?**
A: No, metrics are sent asynchronously and don't block requests.

**Q: What data is collected?**
A: User agents, endpoints accessed, success/failure, response times. No request bodies or sensitive data.

**Q: Can I self-host the metrics?**
A: Enterprise plans include self-hosted options.

**Q: How long is data retained?**
A: 90 days for free tier, 1 year for paid plans, unlimited for enterprise.

## Support

- Email: support@devmcp.ai
- Discord: https://discord.gg/devmcp
- GitHub: https://github.com/devmcp/llms-metrics