// Example: Integrating llms.txt Metrics into Your API
// This shows how to track AI agent usage of your API

import { LLMsMetricsTracker } from '@devmcp/llms-metrics';

// Initialize tracker with your API key and domain
const tracker = new LLMsMetricsTracker(
    process.env.DEVMCP_API_KEY,
    'your-domain.com'
);

// Example 1: Add tracking beacon to your llms.txt
export async function generateLlmsTxt() {
    const beacon = tracker.generateBeacon();
    
    const llmsTxt = `# ${process.env.COMPANY_NAME} API Discovery File
# This file helps AI agents understand and integrate with our APIs

title: ${process.env.COMPANY_NAME} API
description: ${process.env.API_DESCRIPTION}
version: 2.0
base_url: https://api.your-domain.com

# Authentication
auth:
  type: bearer
  description: Use your API key as a bearer token

# Main endpoints
endpoints:
  - path: /v1/query
    method: POST
    description: Execute queries against our database
    
  - path: /v1/data
    method: GET
    description: Retrieve data with filtering
    
# Examples
examples:
  - title: Basic Query
    code: |
      curl -X POST https://api.your-domain.com/v1/query \\
        -H "Authorization: Bearer YOUR_API_KEY" \\
        -H "Content-Type: application/json" \\
        -d '{"query": "SELECT * FROM users LIMIT 10"}'

${beacon}`;

    return llmsTxt;
}

// Example 2: Track API usage in your endpoints
export async function handleAPIRequest(req, res) {
    const startTime = Date.now();
    
    try {
        // Your API logic here
        const result = await processRequest(req);
        
        // Track successful usage
        await tracker.trackAPIUsage(
            req.headers.authorization,
            req.path,
            {
                success: true,
                responseTime: Date.now() - startTime
            }
        );
        
        res.json(result);
        
    } catch (error) {
        // Track failed usage
        await tracker.trackAPIUsage(
            req.headers.authorization,
            req.path,
            {
                success: false,
                responseTime: Date.now() - startTime,
                errorCode: error.code || 'INTERNAL_ERROR'
            }
        );
        
        res.status(500).json({ error: error.message });
    }
}

// Example 3: Express middleware for automatic tracking
export function llmsMetricsMiddleware(tracker) {
    return async (req, res, next) => {
        // Check if request is from an AI agent
        const userAgent = req.headers['user-agent'] || '';
        const isAIAgent = [
            'Claude', 'ChatGPT', 'GPT-4', 'Cursor', 
            'Copilot', 'Gemini', 'Cody'
        ].some(agent => userAgent.includes(agent));
        
        if (!isAIAgent) {
            return next();
        }
        
        const startTime = Date.now();
        
        // Override res.json to track response
        const originalJson = res.json;
        res.json = function(data) {
            // Track the API call
            tracker.trackAPIUsage(
                req.headers.authorization,
                req.path,
                {
                    success: res.statusCode < 400,
                    responseTime: Date.now() - startTime,
                    errorCode: res.statusCode >= 400 ? res.statusCode : null
                }
            ).catch(console.error);
            
            return originalJson.call(this, data);
        };
        
        next();
    };
}

// Example 4: Usage with Express
import express from 'express';
const app = express();

// Add metrics middleware
app.use(llmsMetricsMiddleware(tracker));

// Your API routes
app.post('/v1/query', handleAPIRequest);
app.get('/v1/data', handleAPIRequest);

// Serve llms.txt with tracking beacon
app.get('/llms.txt', async (req, res) => {
    const llmsTxt = await generateLlmsTxt();
    res.type('text/plain').send(llmsTxt);
});

// Example 5: Advanced tracking with context
export class AIContextTracker {
    constructor(tracker) {
        this.tracker = tracker;
        this.sessions = new Map();
    }
    
    startSession(sessionId, context) {
        this.sessions.set(sessionId, {
            startTime: Date.now(),
            context: context,
            apiCalls: []
        });
    }
    
    trackCall(sessionId, endpoint, result) {
        const session = this.sessions.get(sessionId);
        if (!session) return;
        
        session.apiCalls.push({
            endpoint,
            timestamp: Date.now(),
            success: result.success
        });
        
        // Track implementation progress
        if (session.apiCalls.length >= 3) {
            // AI has made multiple calls - likely implementing
            this.tracker.trackEvent('implementation_started', {
                session_id: sessionId,
                api_calls: session.apiCalls.length
            });
        }
    }
    
    endSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) return;
        
        const duration = Date.now() - session.startTime;
        const successRate = session.apiCalls.filter(c => c.success).length / 
                          session.apiCalls.length;
        
        // Track session completion
        this.tracker.trackEvent('session_completed', {
            session_id: sessionId,
            duration_ms: duration,
            total_api_calls: session.apiCalls.length,
            success_rate: successRate,
            context: session.context
        });
        
        this.sessions.delete(sessionId);
    }
}