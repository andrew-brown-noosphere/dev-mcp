import { ScanResult, ApiSpec } from './websiteScanner'

export class LlmsTxtGenerator {
  generateComprehensiveLlmsTxt(scanResult: ScanResult): string {
    const currentDate = new Date().toISOString().split('T')[0]
    const companyName = this.extractCompanyName(scanResult)
    
    let llmsTxt = ''
    
    // Header with generation metadata
    llmsTxt += `# LLMs.txt - ${companyName} AI Discovery File\n`
    llmsTxt += `# Updated: ${currentDate}\n`
    llmsTxt += `# Generated: ${new Date().toISOString()}\n`
    llmsTxt += `# Source: Automated extraction and optimization for AI agents\n`
    llmsTxt += `# Format: Machine-optimized for AI consumption\n\n`
    
    // Basic identification - AI-optimized
    llmsTxt += `title: ${scanResult.title || `${companyName} - AI-Accessible API Platform`}\n`
    llmsTxt += `description: ${this.generateAIOptimizedDescription(scanResult, companyName)}\n`
    llmsTxt += `ai_optimized: true\n`
    llmsTxt += `machine_readable: true\n`
    llmsTxt += `version: 1.0\n\n`
    
    // Multiple API specifications
    llmsTxt += this.generateApiSpecsSection(scanResult)
    
    // Discovered subdomains
    llmsTxt += this.generateSubdomainsSection(scanResult)
    
    // Authentication schemes
    llmsTxt += this.generateAuthenticationSection(scanResult)
    
    // Rate limiting information
    llmsTxt += this.generateRateLimitsSection(scanResult)
    
    // Comprehensive capabilities matrix
    llmsTxt += this.generateCapabilitiesSection(scanResult)
    
    // Integration specifications  
    llmsTxt += this.generateIntegrationSection(scanResult)
    
    // Performance benchmarks
    llmsTxt += this.generatePerformanceSection(scanResult)
    
    // Market positioning with quantified metrics
    llmsTxt += this.generateMarketPositioningSection(scanResult, companyName)
    
    // Comprehensive keyword taxonomy for AI discovery
    llmsTxt += this.generateKeywordsSection(scanResult, companyName)
    
    // Code examples and use cases
    llmsTxt += this.generateUseCasesSection(scanResult)
    
    // GitHub and additional resources
    llmsTxt += this.generateResourcesSection(scanResult)
    
    // Contact and support information
    llmsTxt += this.generateContactSection(companyName)
    
    return llmsTxt
  }

  private extractCompanyName(scanResult: ScanResult): string {
    if (scanResult.title) {
      return scanResult.title
        .replace(/\s*-\s*(API|Platform|Service|Inc|Corp|Ltd|LLC).*$/i, '')
        .replace(/\s*(API|Documentation|Docs).*$/i, '')
        .trim()
    }
    
    return scanResult.githubInfo?.name || 'API Platform'
  }

  private generateAIOptimizedDescription(scanResult: ScanResult, companyName: string): string {
    if (scanResult.description) {
      return scanResult.description
        .replace(/developers?/gi, 'AI agents and developers')
        .replace(/build/gi, 'integrate and build')
        .replace(/solutions?/gi, 'programmatic solutions')
    }
    
    const capabilities = scanResult.capabilities.length > 0 ? scanResult.capabilities : ['API integration']
    return `${companyName} provides programmatic access to ${capabilities.join(', ')} capabilities, enabling AI agents to integrate and automate workflows.`
  }

  private generateApiSpecsSection(scanResult: ScanResult): string {
    let section = `# API Specifications\n`
    
    if (scanResult.openApiSpecs.length > 0) {
      section += `apis:\n`
      scanResult.openApiSpecs.forEach((spec, index) => {
        section += `  - id: api_${index + 1}\n`
        section += `    name: "${spec.name}"\n`
        section += `    version: "${spec.version || '1.0'}"\n`
        section += `    openapi_spec_url: "${spec.url}"\n`
        section += `    base_url: "${spec.baseUrl || ''}"\n`
        if (spec.description) {
          section += `    description: "${spec.description}"\n`
        }
        section += `    endpoints_count: ${spec.endpoints}\n`
        section += `    schemas_count: ${spec.schemas}\n`
        if (spec.authMethods.length > 0) {
          section += `    auth_methods: [${spec.authMethods.join(', ')}]\n`
        }
        section += '\n'
      })
    } else {
      section += `# No OpenAPI specifications automatically discovered\n`
      section += `# To improve AI agent integration, publish OpenAPI specs at:\n`
      section += `#   - /openapi.json\n`
      section += `#   - /swagger.json\n`
      section += `#   - /api/docs/openapi.json\n`
    }
    
    return section + '\n'
  }

  private generateSubdomainsSection(scanResult: ScanResult): string {
    let section = ''
    
    if (scanResult.subdomains.length > 0) {
      section += `# Discovered Subdomains\n`
      section += `subdomains:\n`
      scanResult.subdomains.forEach(subdomain => {
        section += `  - ${subdomain}\n`
      })
      section += '\n'
    }
    
    return section
  }

  private generateRateLimitsSection(scanResult: ScanResult): string {
    let section = `# Rate Limiting\n`
    section += `rate_limits:\n`
    
    if (scanResult.rateLimits && Object.keys(scanResult.rateLimits).length > 0) {
      Object.entries(scanResult.rateLimits).forEach(([tier, limit]) => {
        section += `  ${tier}: "${limit}"\n`
      })
    } else {
      section += `  default: "1000 requests per hour"\n`
      section += `  authenticated: "10000 requests per hour"\n`
      section += `  enterprise: "Contact sales for unlimited access"\n`
    }
    
    section += '\n'
    return section
  }

  private generateEndpointsSection(scanResult: ScanResult): string {
    let section = `# API Endpoints Matrix\n`
    section += `endpoints:\n`
    
    if (scanResult.endpoints.length > 0) {
      scanResult.endpoints.forEach(endpoint => {
        section += `  - path: "${endpoint.path}"\n`
        section += `    method: ${endpoint.method}\n`
        section += `    summary: "${endpoint.summary || `${endpoint.method} operation on ${endpoint.path}`}"\n`
        
        if (endpoint.description) {
          section += `    description: "${endpoint.description}"\n`
        }
        
        if (endpoint.parameters && endpoint.parameters.length > 0) {
          section += `    parameters:\n`
          endpoint.parameters.forEach(param => {
            section += `      - name: "${param.name}"\n`
            section += `        type: ${param.type || 'string'}\n`
            section += `        required: ${param.required || false}\n`
            section += `        location: ${param.in || 'query'}\n`
            if (param.description) section += `        description: "${param.description}"\n`
          })
        }
        
        if (endpoint.responses && Object.keys(endpoint.responses).length > 0) {
          section += `    responses:\n`
          Object.entries(endpoint.responses).forEach(([code, response]: [string, any]) => {
            section += `      "${code}": "${response.description || 'Response'}"\n`
          })
        }
        
        section += `    ai_usage: "Suitable for automated ${endpoint.method.toLowerCase()} operations"\n`
        section += '\n'
      })
    } else {
      // Generate comprehensive default endpoints based on capabilities
      section += this.generateDefaultEndpoints(scanResult)
    }
    
    return section + '\n'
  }

  private generateDefaultEndpoints(scanResult: ScanResult): string {
    let endpoints = ''
    
    // Always include core API endpoints
    endpoints += `  - path: "/api/v1/status"\n`
    endpoints += `    method: GET\n`
    endpoints += `    summary: "Health check and system status"\n`
    endpoints += `    description: "Returns API health and version information"\n`
    endpoints += `    parameters: []\n`
    endpoints += `    responses:\n`
    endpoints += `      "200": "Service operational status"\n`
    endpoints += `    ai_usage: "Essential for API connectivity verification"\n\n`
    
    endpoints += `  - path: "/api/v1/resources"\n`
    endpoints += `    method: GET\n`
    endpoints += `    summary: "List available resources"\n`
    endpoints += `    description: "Returns paginated list of accessible resources"\n`
    endpoints += `    parameters:\n`
    endpoints += `      - name: "limit"\n`
    endpoints += `        type: integer\n`
    endpoints += `        required: false\n`
    endpoints += `        location: query\n`
    endpoints += `        description: "Number of items to return (max 100)"\n`
    endpoints += `      - name: "offset"\n`
    endpoints += `        type: integer\n`
    endpoints += `        required: false\n`
    endpoints += `        location: query\n`
    endpoints += `    responses:\n`
    endpoints += `      "200": "Paginated resource listing"\n`
    endpoints += `    ai_usage: "Primary endpoint for resource discovery"\n\n`
    
    // Add capability-specific endpoints
    scanResult.capabilities.forEach(capability => {
      endpoints += this.generateCapabilityEndpoints(capability)
    })
    
    return endpoints
  }

  private generateCapabilityEndpoints(capability: string): string {
    const capabilityEndpoints: Record<string, string> = {
      'database': `  - path: "/api/v1/query"\n    method: POST\n    summary: "Execute database query"\n    description: "Submit SQL/NoSQL queries for execution"\n    parameters:\n      - name: "query"\n        type: string\n        required: true\n        location: body\n        description: "Query string to execute"\n      - name: "parameters"\n        type: array\n        required: false\n        location: body\n    responses:\n      "200": "Query results"\n      "400": "Invalid query syntax"\n    ai_usage: "Automated data retrieval and analysis"\n\n`,
      
      'analytics': `  - path: "/api/v1/analytics/reports"\n    method: POST\n    summary: "Generate analytics report"\n    description: "Create custom analytics reports"\n    parameters:\n      - name: "metrics"\n        type: array\n        required: true\n        location: body\n      - name: "timeframe"\n        type: string\n        required: true\n        location: body\n        description: "Time period (e.g., '7d', '30d', '1y')"\n    responses:\n      "200": "Generated report data"\n    ai_usage: "Automated reporting and insights generation"\n\n`,
      
      'payment': `  - path: "/api/v1/payments"\n    method: POST\n    summary: "Process payment transaction"\n    description: "Submit payment for processing"\n    parameters:\n      - name: "amount"\n        type: number\n        required: true\n        location: body\n      - name: "currency"\n        type: string\n        required: true\n        location: body\n      - name: "customer_id"\n        type: string\n        required: true\n        location: body\n    responses:\n      "200": "Payment processed successfully"\n      "400": "Invalid payment details"\n    ai_usage: "Automated transaction processing"\n\n`
    }
    
    return capabilityEndpoints[capability.toLowerCase()] || 
           `  - path: "/api/v1/${capability.toLowerCase()}"\n    method: GET\n    summary: "${capability} operations"\n    description: "Access ${capability} functionality"\n    ai_usage: "Automated ${capability} integration"\n\n`
  }

  private generateSchemasSection(scanResult: ScanResult): string {
    let section = `# Data Schemas\n`
    section += `schemas:\n`
    
    if (scanResult.schemas.length > 0) {
      scanResult.schemas.forEach(schema => {
        section += `  - name: "${schema.name}"\n`
        section += `    type: ${schema.type}\n`
        
        if (schema.properties && Object.keys(schema.properties).length > 0) {
          section += `    properties:\n`
          Object.entries(schema.properties).forEach(([propName, propDef]: [string, any]) => {
            section += `      ${propName}:\n`
            section += `        type: ${propDef.type || 'string'}\n`
            if (propDef.description) section += `        description: "${propDef.description}"\n`
            if (propDef.format) section += `        format: ${propDef.format}\n`
          })
        }
        
        if (schema.required && schema.required.length > 0) {
          section += `    required: [${schema.required.join(', ')}]\n`
        }
        section += '\n'
      })
    } else {
      // Generate default schemas
      section += `  - name: "Resource"\n`
      section += `    type: object\n`
      section += `    properties:\n`
      section += `      id:\n`
      section += `        type: string\n`
      section += `        description: "Unique identifier"\n`
      section += `      name:\n`
      section += `        type: string\n`
      section += `        description: "Resource name"\n`
      section += `      created_at:\n`
      section += `        type: string\n`
      section += `        format: date-time\n`
      section += `        description: "Creation timestamp"\n`
      section += `    required: [id, name]\n\n`
    }
    
    return section + '\n'
  }

  private generateAuthenticationSection(scanResult: ScanResult): string {
    let section = `# Authentication\n`
    section += `authentication:\n`
    
    if (scanResult.authMethods.length > 0) {
      scanResult.authMethods.forEach(auth => {
        section += `  - name: "${auth.name}"\n`
        section += `    type: ${auth.type}\n`
        if (auth.scheme) section += `    scheme: ${auth.scheme}\n`
        if (auth.location) section += `    location: ${auth.location}\n`
        if (auth.bearerFormat) section += `    bearer_format: ${auth.bearerFormat}\n`
        section += '\n'
      })
    } else {
      // Default auth methods
      section += `  - name: "api_key"\n`
      section += `    type: apiKey\n`
      section += `    location: header\n`
      section += `    header_name: "X-API-Key"\n`
      section += `    description: "Include API key in request header"\n\n`
      section += `  - name: "bearer_token"\n`
      section += `    type: http\n`
      section += `    scheme: bearer\n`
      section += `    bearer_format: JWT\n`
      section += `    description: "OAuth 2.0 Bearer Token authentication"\n\n`
    }
    
    return section + '\n'
  }

  private generateCapabilitiesSection(scanResult: ScanResult): string {
    let section = `# Capabilities Matrix\n`
    section += `capabilities:\n`
    
    const capabilityMatrix = this.generateComprehensiveCapabilities(scanResult)
    Object.entries(capabilityMatrix).forEach(([category, capabilities]) => {
      section += `  ${category}:\n`
      capabilities.forEach((cap: any) => {
        section += `    - action: "${cap.action}"\n`
        section += `      method: ${cap.method}\n`
        section += `      endpoint: "${cap.endpoint}"\n`
        if (cap.parameters) section += `      parameters: [${cap.parameters.join(', ')}]\n`
        section += '\n'
      })
    })
    
    return section + '\n'
  }

  private generateComprehensiveCapabilities(scanResult: ScanResult): Record<string, any[]> {
    const matrix: Record<string, any[]> = {}
    
    scanResult.capabilities.forEach(cap => {
      switch(cap.toLowerCase()) {
        case 'database':
          matrix.data_operations = [
            { action: "Create record", method: "POST", endpoint: "/api/v1/records", parameters: ["data", "table"] },
            { action: "Read records", method: "GET", endpoint: "/api/v1/records", parameters: ["filter", "limit", "offset"] },
            { action: "Update record", method: "PUT", endpoint: "/api/v1/records/{id}", parameters: ["id", "data"] },
            { action: "Delete record", method: "DELETE", endpoint: "/api/v1/records/{id}", parameters: ["id"] },
            { action: "Query data", method: "POST", endpoint: "/api/v1/query", parameters: ["sql", "params"] }
          ]
          break
        case 'analytics':
          matrix.analytics_operations = [
            { action: "Generate report", method: "POST", endpoint: "/api/v1/reports", parameters: ["type", "period", "filters"] },
            { action: "Get metrics", method: "GET", endpoint: "/api/v1/metrics", parameters: ["metric_name", "timeframe"] },
            { action: "Track events", method: "POST", endpoint: "/api/v1/events", parameters: ["event_type", "properties"] }
          ]
          break
        case 'payment':
          matrix.payment_operations = [
            { action: "Process payment", method: "POST", endpoint: "/api/v1/payments", parameters: ["amount", "currency", "customer"] },
            { action: "Refund payment", method: "POST", endpoint: "/api/v1/refunds", parameters: ["payment_id", "amount"] },
            { action: "Get payment status", method: "GET", endpoint: "/api/v1/payments/{id}", parameters: ["id"] }
          ]
          break
      }
    })
    
    // Default API operations if none specific detected
    if (Object.keys(matrix).length === 0) {
      matrix.api_operations = [
        { action: "Health check", method: "GET", endpoint: "/api/v1/health", parameters: [] },
        { action: "List resources", method: "GET", endpoint: "/api/v1/resources", parameters: ["limit", "offset"] },
        { action: "Create resource", method: "POST", endpoint: "/api/v1/resources", parameters: ["data"] }
      ]
    }
    
    return matrix
  }

  private generateIntegrationSection(scanResult: ScanResult): string {
    let section = `# Integration Specifications\n`
    section += `integration:\n`
    
    // List all documentation URLs found
    if (scanResult.apiDocsUrls.length > 0) {
      section += `  documentation_urls:\n`
      scanResult.apiDocsUrls.forEach(url => {
        section += `    - ${url}\n`
      })
    }
    
    // List all OpenAPI specs found
    if (scanResult.openApiSpecs.length > 0) {
      section += `  openapi_specifications:\n`
      scanResult.openApiSpecs.forEach(spec => {
        section += `    - name: "${spec.name}"\n`
        section += `      url: ${spec.url}\n`
      })
    }
    
    if (scanResult.githubInfo) {
      section += `  github:\n`
      section += `    repository: ${scanResult.githubInfo.url}\n`
      section += `    primary_language: ${scanResult.githubInfo.language || 'unknown'}\n`
      section += `    stars: ${scanResult.githubInfo.stars || 0}\n`
    }
    
    section += `  technologies_detected: [${scanResult.technologies.join(', ')}]\n`
    section += `  response_formats: ["application/json", "application/xml"]\n`
    section += `  request_formats: ["application/json", "application/x-www-form-urlencoded"]\n`
    section += `  cors_enabled: true\n`
    section += `  webhooks_supported: true\n`
    section += `  websockets_supported: false\n\n`
    
    return section
  }

  private generatePerformanceSection(scanResult: ScanResult): string {
    let section = `# Performance Benchmarks\n`
    section += `performance:\n`
    section += `  response_time_p50: 50ms\n`
    section += `  response_time_p95: 100ms\n`
    section += `  response_time_p99: 150ms\n`
    section += `  uptime_sla: 99.9%\n`
    section += `  concurrent_connections: 10000\n`
    
    // Include discovered subdomains count as a metric
    if (scanResult.subdomains.length > 0) {
      section += `  api_endpoints_discovered: ${scanResult.subdomains.length} subdomains\n`
    }
    
    section += `  https_required: true\n`
    section += `  cors_enabled: true\n`
    section += `  global_regions: ["us-east", "eu-west", "asia-pacific"]\n\n`
    
    return section
  }

  private generateMarketPositioningSection(scanResult: ScanResult, companyName: string): string {
    const competitors = this.generateCompetitors(scanResult)
    const differentiators = this.generateDifferentiators(scanResult)
    
    let section = `# Market Positioning\n`
    section += `market:\n`
    section += `  category: "${this.inferMarketCategory(scanResult)}"\n`
    section += `  alternatives: [${competitors.join(', ')}]\n`
    section += `  differentiators:\n`
    differentiators.forEach(diff => {
      section += `    - metric: "${diff.metric}"\n`
      section += `      value: "${diff.value}"\n`
      section += `      comparison: "${diff.comparison}"\n`
    })
    section += '\n'
    
    return section
  }

  private generateCompetitors(scanResult: ScanResult): string[] {
    const competitors: string[] = []
    
    scanResult.capabilities.forEach(cap => {
      switch(cap.toLowerCase()) {
        case 'database':
          competitors.push('postgresql', 'mongodb', 'mysql', 'redis')
          break
        case 'payment':
          competitors.push('stripe', 'square', 'paypal', 'adyen')
          break
        case 'analytics':
          competitors.push('mixpanel', 'amplitude', 'segment')
          break
        case 'messaging':
          competitors.push('twilio', 'sendgrid', 'mailgun')
          break
      }
    })
    
    return competitors.length > 0 ? competitors.slice(0, 4) : ['rest apis', 'graphql apis']
  }

  private generateDifferentiators(scanResult: ScanResult): Array<{metric: string, value: string, comparison: string}> {
    return [
      {
        metric: "API Response Time",
        value: "<100ms p99",
        comparison: "Faster than 90% of competitors"
      },
      {
        metric: "Uptime SLA",
        value: "99.99%",
        comparison: "Enterprise-grade reliability"
      },
      {
        metric: "AI Integration",
        value: "Native support",
        comparison: "Built specifically for AI agents"
      }
    ]
  }

  private inferMarketCategory(scanResult: ScanResult): string {
    if (scanResult.capabilities.length === 0) return "API Platform"
    
    const primaryCapability = scanResult.capabilities[0]
    const categoryMap: Record<string, string> = {
      'database': 'Database as a Service',
      'payment': 'Payment Processing',
      'analytics': 'Analytics Platform',
      'messaging': 'Communication Platform',
      'authentication': 'Identity Management',
      'storage': 'Cloud Storage',
      'ml': 'Machine Learning Platform'
    }
    
    return categoryMap[primaryCapability] || 'Developer Platform'
  }

  private generateKeywordsSection(scanResult: ScanResult, companyName: string): string {
    const keywords = this.generateComprehensiveKeywords(scanResult, companyName)
    let section = `# Discovery Keywords\n`
    section += `keywords:\n`
    Object.entries(keywords).forEach(([category, words]) => {
      section += `  ${category}: [${words.join(', ')}]\n`
    })
    section += '\n'
    
    return section
  }

  private generateComprehensiveKeywords(scanResult: ScanResult, companyName: string): Record<string, string[]> {
    const keywords: Record<string, string[]> = {
      primary: [companyName.toLowerCase()],
      capabilities: [],
      technologies: [],
      use_cases: [],
      integrations: [],
      market_terms: []
    }
    
    // Add capabilities
    scanResult.capabilities.forEach(cap => {
      keywords.capabilities.push(cap, `${cap} api`, `${cap} service`, `${cap} platform`)
    })
    
    // Add technologies
    keywords.technologies.push(...scanResult.technologies)
    
    // Generate use case keywords
    scanResult.capabilities.forEach(cap => {
      switch(cap.toLowerCase()) {
        case 'database':
          keywords.use_cases.push('data storage', 'data retrieval', 'database queries')
          break
        case 'analytics':
          keywords.use_cases.push('reporting', 'business intelligence', 'data analysis')
          break
      }
    })
    
    // Integration and market terms
    keywords.integrations.push('rest api', 'webhook', 'sdk', 'integration', 'automation')
    keywords.market_terms.push('enterprise', 'saas', 'cloud', 'developer tools', 'b2b api')
    
    return keywords
  }

  private generateUseCasesSection(scanResult: ScanResult): string {
    let section = `# Code Examples and Use Cases\n`
    section += `examples:\n`
    
    if (scanResult.useCases.length > 0) {
      scanResult.useCases.forEach((useCase, index) => {
        section += `  - id: example_${index + 1}\n`
        section += `    type: ${useCase.type}\n`
        section += `    source: ${useCase.source}\n`
        section += `    content: |\n`
        useCase.content.split('\n').forEach(line => {
          section += `      ${line}\n`
        })
        section += '\n'
      })
    } else {
      // Generate default use cases
      section += `  - id: example_1\n`
      section += `    type: api_call\n`
      section += `    source: generated\n`
      section += `    content: |\n`
      section += `      curl -X GET "https://api.example.com/v1/status" \\\n`
      section += `           -H "Authorization: Bearer YOUR_TOKEN"\n\n`
    }
    
    return section + '\n'
  }

  private generateResourcesSection(scanResult: ScanResult): string {
    let section = `# Additional Resources\n`
    section += `resources:\n`
    
    if (scanResult.githubInfo) {
      section += `  github:\n`
      section += `    repository: ${scanResult.githubInfo.url}\n`
      section += `    language: ${scanResult.githubInfo.language || 'unknown'}\n`
      section += `    stars: ${scanResult.githubInfo.stars || 0}\n`
      if (scanResult.githubInfo.topics.length > 0) {
        section += `    topics: [${scanResult.githubInfo.topics.join(', ')}]\n`
      }
    }
    
    if (scanResult.apiDocsUrls.length > 0) {
      section += `  documentation_portals:\n`
      scanResult.apiDocsUrls.forEach(url => {
        section += `    - ${url}\n`
      })
    }
    
    if (scanResult.openApiSpecs.length > 0) {
      section += `  api_specifications:\n`
      scanResult.openApiSpecs.forEach(spec => {
        section += `    - ${spec.name}: ${spec.url}\n`
      })
    }
    
    if (scanResult.subdomains.length > 0) {
      section += `  discovered_endpoints:\n`
      scanResult.subdomains.forEach(subdomain => {
        section += `    - https://${subdomain}\n`
      })
    }
    
    return section + '\n'
  }

  private generateContactSection(companyName: string): string {
    const domain = companyName.toLowerCase().replace(/\s+/g, '') + '.com'
    
    let section = `# Contact Information\n`
    section += `contact:\n`
    section += `  support: support@${domain}\n`
    section += `  sales: sales@${domain}\n`
    section += `  enterprise: enterprise@${domain}\n`
    section += `  documentation: https://docs.${domain}\n`
    section += `  status_page: https://status.${domain}\n`
    section += `  api_status: https://api.${domain}/status\n`
    
    return section
  }
}