# Publishing MCP Servers in llms.txt

## Overview
Publishing your MCP server in llms.txt enables AI agents to automatically discover and connect to your tools, creating a seamless integration experience.

## MCP Section Structure

### Basic MCP Declaration
```yaml
# In your llms.txt file
mcp:
  server: wss://mcp.your-domain.com
  protocol: model-context-protocol
  version: 1.0
```

### Full MCP Configuration
```yaml
mcp:
  # Primary WebSocket endpoint
  server: wss://mcp.your-domain.com
  
  # Protocol information
  protocol: model-context-protocol
  version: 1.0
  
  # Alternative transports
  transports:
    websocket: wss://mcp.your-domain.com
    http: https://mcp-http.your-domain.com
    stdio: available  # For local CLI tools
  
  # Authentication
  authentication:
    type: api-key  # or: oauth, bearer, basic, none
    header: X-API-Key
    endpoint: https://api.your-domain.com/auth/mcp
    instructions: |
      Get your API key from https://your-domain.com/dashboard
      Include it in the X-API-Key header
  
  # Available tools/functions
  tools:
    - name: create_database
      description: Create a new database instance
      parameters:
        - name: string
        - type: string (postgresql, mysql, mongodb)
        - config: object (optional)
    
    - name: run_query
      description: Execute a query against your database
      parameters:
        - query: string
        - database: string
        - timeout: number (optional)
    
    - name: generate_schema
      description: Generate optimal schema for your use case
      parameters:
        - use_case: string
        - scale: string (small, medium, large)
        - requirements: array<string>
    
    - name: analyze_performance
      description: Analyze query performance
      parameters:
        - query: string
        - explain: boolean
  
  # Tool categories (helps AI understand capabilities)
  capabilities:
    - database_management
    - query_execution
    - schema_generation
    - performance_optimization
    - data_migration
    - backup_restore
  
  # Connection instructions for AI agents
  connect_instructions: |
    To connect to our MCP server:
    1. Connect to WebSocket: wss://mcp.your-domain.com
    2. Send authentication: { "type": "auth", "apiKey": "YOUR_KEY" }
    3. Receive ready signal: { "type": "ready", "tools": [...] }
    4. Call tools: { "type": "invoke", "tool": "run_query", "params": {...} }
  
  # Discovery endpoints
  discovery:
    tools_list: https://api.your-domain.com/mcp/tools
    capabilities: https://api.your-domain.com/mcp/capabilities
    openapi: https://api.your-domain.com/mcp/openapi.json
  
  # Rate limits (helps AI agents behave properly)
  rate_limits:
    requests_per_minute: 60
    concurrent_connections: 5
    max_payload_size: 10MB
  
  # SDKs for different environments
  sdks:
    javascript: npm install @your-company/mcp-client
    python: pip install your-company-mcp
    go: go get github.com/your-company/mcp-go
  
  # Example usage
  examples:
    - title: Quick connection
      code: |
        import { MCPClient } from '@your-company/mcp-client';
        
        const client = new MCPClient({
          server: 'wss://mcp.your-domain.com',
          apiKey: process.env.YOUR_API_KEY
        });
        
        await client.connect();
        const result = await client.invoke('run_query', {
          query: 'SELECT * FROM users LIMIT 10',
          database: 'production'
        });
```

## Implementation Examples

### 1. Database Platform (ScyllaDB-style)
```yaml
mcp:
  server: wss://mcp.scylladb.com
  protocol: model-context-protocol
  
  authentication:
    type: api-key
    header: X-ScyllaDB-Key
  
  tools:
    - name: create_keyspace
      description: Create a new ScyllaDB keyspace
    - name: generate_schema
      description: Generate optimal schema for your use case
    - name: run_cql
      description: Execute CQL queries
    - name: analyze_performance
      description: Get performance insights
    - name: migrate_from_cassandra
      description: Migrate from Apache Cassandra
  
  capabilities:
    - nosql_database
    - distributed_systems
    - real_time_analytics
    - data_modeling
```

### 2. API Gateway (Stripe-style)
```yaml
mcp:
  server: wss://mcp.stripe.com
  protocol: model-context-protocol
  
  authentication:
    type: bearer
    instructions: Use your Stripe secret key as bearer token
  
  tools:
    - name: create_payment_intent
      description: Create a payment intent
    - name: setup_subscription
      description: Set up recurring billing
    - name: generate_checkout
      description: Generate checkout session
    - name: test_webhook
      description: Test webhook integration
  
  capabilities:
    - payments_processing
    - subscription_management
    - financial_compliance
    - webhook_testing
```

### 3. AI/ML Platform
```yaml
mcp:
  server: wss://mcp.huggingface.co
  protocol: model-context-protocol
  
  tools:
    - name: deploy_model
      description: Deploy a model to production
    - name: run_inference
      description: Run inference on deployed model
    - name: fine_tune
      description: Fine-tune a model on your data
    - name: evaluate_model
      description: Evaluate model performance
  
  capabilities:
    - model_deployment
    - inference_api
    - model_training
    - dataset_management
```

## Best Practices

### 1. Tool Naming
- Use clear, action-oriented names: `create_database`, not `database`
- Be consistent: `get_users`, `get_posts`, `get_comments`
- Include the object: `delete_record`, not just `delete`

### 2. Authentication
- Provide clear instructions for obtaining credentials
- Support multiple auth methods if possible
- Include example headers/tokens

### 3. Rate Limiting
- Clearly specify limits to prevent AI from overwhelming your service
- Include both per-minute and concurrent connection limits
- Provide guidance on handling rate limit errors

### 4. Error Handling
```yaml
mcp:
  error_handling:
    retry_strategy: exponential_backoff
    max_retries: 3
    error_codes:
      - code: 429
        message: Rate limit exceeded
        retry_after: 60
      - code: 401
        message: Invalid authentication
        action: refresh_token
```

### 5. Versioning
```yaml
mcp:
  server: wss://mcp.your-domain.com
  version: 2.0
  
  # Support multiple versions
  versions:
    - version: 2.0
      server: wss://mcp.your-domain.com/v2
      status: stable
    - version: 1.0
      server: wss://mcp.your-domain.com/v1
      status: deprecated
      sunset: 2025-12-31
```

## Testing Your MCP Declaration

### 1. Validate Structure
```bash
# Use a YAML validator
yamllint llms.txt

# Check MCP section specifically
yq '.mcp' llms.txt
```

### 2. Test Discovery
```javascript
// Test that AI agents can discover your MCP server
const response = await fetch('https://your-domain.com/llms.txt');
const content = await response.text();
const mcp = parseLLMsTxt(content).mcp;

console.log('MCP Server:', mcp.server);
console.log('Available tools:', mcp.tools);
```

### 3. Connection Test
```javascript
// Test WebSocket connection
const ws = new WebSocket('wss://mcp.your-domain.com');

ws.on('open', () => {
  console.log('Connected to MCP server');
  
  // Send auth
  ws.send(JSON.stringify({
    type: 'auth',
    apiKey: 'test-key'
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  console.log('MCP response:', msg);
});
```

## Integration with AI Agents

### How AI Agents Use MCP Info

1. **Discovery Phase**
   ```javascript
   // AI agent discovers llms.txt
   const llmsTxt = await fetch('https://your-domain.com/llms.txt');
   const { mcp } = parseLLMsTxt(await llmsTxt.text());
   ```

2. **Connection Phase**
   ```javascript
   // AI connects to MCP server
   const client = new MCPClient(mcp.server);
   await client.authenticate(mcp.authentication);
   ```

3. **Capability Discovery**
   ```javascript
   // AI lists available tools
   const tools = await client.listTools();
   // Show to user: "I can help you: create databases, run queries, etc."
   ```

4. **Execution Phase**
   ```javascript
   // AI executes user request
   const result = await client.invoke('create_database', {
     name: 'my_app_db',
     type: 'postgresql'
   });
   ```

## Monitoring MCP Usage

Add tracking to understand how AI agents use your MCP server:

```yaml
mcp:
  # Analytics endpoint for usage tracking
  analytics:
    endpoint: https://api.your-domain.com/mcp/analytics
    events:
      - connection_established
      - tool_invoked
      - error_occurred
      - session_completed
```

This allows you to track:
- Which AI agents connect most often
- Most used tools
- Common error patterns
- Integration success rates

## Security Considerations

1. **Authentication is Critical**
   - Always require authentication
   - Use secure token generation
   - Implement token expiration

2. **Rate Limiting**
   - Protect against runaway AI loops
   - Implement per-tool limits
   - Monitor for abuse patterns

3. **Capability Restrictions**
   - Don't expose destructive operations without confirmation
   - Implement permission levels
   - Log all operations for audit

4. **Data Privacy**
   - Don't expose sensitive data through MCP
   - Implement data filtering
   - Honor data residency requirements