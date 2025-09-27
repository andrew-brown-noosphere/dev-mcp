import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import yaml from 'js-yaml'

export interface ApiSpec {
  url: string
  name: string
  description?: string
  version?: string
  baseUrl?: string
  endpoints: number
  schemas: number
  authMethods: string[]
}

export interface ScanResult {
  title: string
  description: string
  hasApiDocs: boolean
  apiDocsUrls: string[]
  openApiSpecs: ApiSpec[]
  capabilities: string[]
  technologies: string[]
  subdomains: string[]
  endpoints: Array<{
    path: string
    method: string
    summary?: string
    description?: string
    apiSpec?: string
    parameters?: Array<{
      name: string
      type: string
      required: boolean
      in: string
      description?: string
    }>
    responses?: Record<string, any>
  }>
  schemas: Array<{
    name: string
    type: string
    apiSpec?: string
    properties: Record<string, any>
    required?: string[]
  }>
  authMethods: Array<{
    name: string
    type: string
    scheme?: string
    location?: string
    bearerFormat?: string
    apiSpec?: string
  }>
  useCases: Array<{
    type: string
    content: string
    source: string
  }>
  githubInfo?: {
    url: string
    name: string
    description: string
    language: string
    stars: number
    topics: string[]
  }
  rateLimits?: {
    default?: string
    authenticated?: string
    enterprise?: string
  }
}

export class WebsiteScanner {
  private additionalResources: {
    openApiUrl?: string
    githubRepo?: string
    docsUrl?: string
  }

  constructor(additionalResources: {
    openApiUrl?: string
    githubRepo?: string
    docsUrl?: string
  } = {}) {
    this.additionalResources = additionalResources
  }

  async scanWebsite(websiteUrl: string): Promise<ScanResult> {
    const result: ScanResult = {
      title: '',
      description: '',
      hasApiDocs: false,
      apiDocsUrls: [],
      openApiSpecs: [],
      capabilities: [],
      technologies: [],
      subdomains: [],
      endpoints: [],
      schemas: [],
      authMethods: [],
      useCases: [],
      rateLimits: {}
    }

    try {
      // Clean the URL
      const cleanUrl = websiteUrl.replace(/\/$/, '')
      
      // Scan main website
      await this.scanMainPage(cleanUrl, result)
      
      // Process additional resources
      if (this.additionalResources.openApiUrl) {
        await this.processOpenApiSpec(this.additionalResources.openApiUrl, result)
      }
      
      if (this.additionalResources.githubRepo) {
        await this.processGitHubRepo(this.additionalResources.githubRepo, result)
      }
      
      if (this.additionalResources.docsUrl) {
        await this.processDocsUrl(this.additionalResources.docsUrl, result)
      }

      // Discover subdomains
      await this.discoverSubdomains(cleanUrl, result)
      
      // Auto-discover API documentation and OpenAPI specs
      await this.discoverApiResources(cleanUrl, result)
      
      // Scan discovered subdomains for additional APIs
      for (const subdomain of result.subdomains) {
        await this.discoverApiResources(`https://${subdomain}`, result)
      }

    } catch (error) {
      console.error('Website scanning error:', error)
      // Continue with partial results
    }

    return result
  }

  private async scanMainPage(url: string, result: ScanResult): Promise<void> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LLMs.txt Generator/1.0)'
        },
        timeout: 10000
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      // Extract basic info
      result.title = $('title').text().trim() || $('h1').first().text().trim()
      result.description = $('meta[name="description"]').attr('content') || 
                          $('meta[property="og:description"]').attr('content') || ''

      // Analyze content for capabilities and technologies
      const bodyText = $('body').text().toLowerCase()
      const htmlContent = html.toLowerCase()

      this.extractCapabilities(bodyText, result)
      this.extractTechnologies(htmlContent, result)
      this.detectApiDocumentation(bodyText, htmlContent, result)

    } catch (error) {
      console.error(`Failed to scan main page ${url}:`, error)
    }
  }

  private async processOpenApiSpec(openApiUrl: string, result: ScanResult): Promise<void> {
    try {
      const response = await fetch(openApiUrl, { timeout: 15000 })
      if (!response.ok) return

      const content = await response.text()
      let spec: any

      try {
        spec = JSON.parse(content)
      } catch {
        try {
          spec = yaml.load(content)
        } catch {
          return
        }
      }

      if (!spec.openapi && !spec.swagger) return

      const apiName = spec.info?.title || 'API'
      const apiVersion = spec.info?.version || '1.0'
      const baseUrl = spec.servers?.[0]?.url || openApiUrl.replace(/\/[^\/]*$/, '')

      let endpointCount = 0
      let schemaCount = 0
      const authMethodsSet = new Set<string>()

      // Extract endpoints
      if (spec.paths) {
        Object.entries(spec.paths).forEach(([path, methods]: [string, any]) => {
          Object.entries(methods).forEach(([method, details]: [string, any]) => {
            if (typeof details === 'object' && details !== null) {
              endpointCount++
              result.endpoints.push({
                path,
                method: method.toUpperCase(),
                summary: details.summary || '',
                description: details.description || '',
                apiSpec: apiName,
                parameters: details.parameters || [],
                responses: details.responses || {}
              })
            }
          })
        })
      }

      // Extract schemas
      const schemas = spec.components?.schemas || spec.definitions || {}
      Object.entries(schemas).forEach(([name, schema]: [string, any]) => {
        schemaCount++
        result.schemas.push({
          name,
          type: schema.type || 'object',
          apiSpec: apiName,
          properties: schema.properties || {},
          required: schema.required || []
        })
      })

      // Extract auth methods
      const securitySchemes = spec.components?.securitySchemes || spec.securityDefinitions || {}
      Object.entries(securitySchemes).forEach(([name, scheme]: [string, any]) => {
        authMethodsSet.add(scheme.type)
        result.authMethods.push({
          name,
          type: scheme.type,
          scheme: scheme.scheme,
          location: scheme.in,
          bearerFormat: scheme.bearerFormat,
          apiSpec: apiName
        })
      })

      // Add to OpenAPI specs list
      result.openApiSpecs.push({
        url: openApiUrl,
        name: apiName,
        description: spec.info?.description || '',
        version: apiVersion,
        baseUrl,
        endpoints: endpointCount,
        schemas: schemaCount,
        authMethods: Array.from(authMethodsSet)
      })

    } catch (error) {
      console.error(`Failed to process OpenAPI spec ${openApiUrl}:`, error)
    }
  }

  private async processGitHubRepo(githubUrl: string, result: ScanResult): Promise<void> {
    try {
      const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
      if (!match) return

      const [, owner, repo] = match
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}`

      const response = await fetch(apiUrl, { timeout: 10000 })
      if (!response.ok) return

      const repoInfo = await response.json() as any

      result.githubInfo = {
        url: repoInfo.html_url,
        name: repoInfo.name,
        description: repoInfo.description || '',
        language: repoInfo.language || '',
        stars: repoInfo.stargazers_count || 0,
        topics: repoInfo.topics || []
      }

      // Try to fetch README for examples
      try {
        const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { timeout: 10000 })
        if (readmeResponse.ok) {
          const readmeData = await readmeResponse.json() as any
          const readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8')
          this.extractCodeExamples(readmeContent, result)
        }
      } catch (error) {
        console.log('Could not fetch README:', error)
      }

    } catch (error) {
      console.error(`Failed to process GitHub repo ${githubUrl}:`, error)
    }
  }

  private async processDocsUrl(docsUrl: string, result: ScanResult): Promise<void> {
    try {
      const response = await fetch(docsUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LLMs.txt Generator/1.0)' },
        timeout: 10000
      })

      if (!response.ok) return

      const html = await response.text()
      const $ = cheerio.load(html)
      
      result.hasApiDocs = true
      if (!result.apiDocsUrls.includes(docsUrl)) {
        result.apiDocsUrls.push(docsUrl)
      }

      // Extract API endpoints from documentation
      const text = $('body').text()
      this.extractApiEndpoints(text, result)
      this.extractCodeExamples(html, result)
      
      // Look for links to OpenAPI specs in docs
      $('a[href*="swagger"], a[href*="openapi"], a[href*="api-docs"]').each((_, el) => {
        const href = $(el).attr('href')
        if (href && (href.endsWith('.json') || href.endsWith('.yaml'))) {
          const specUrl = new URL(href, docsUrl).toString()
          this.processOpenApiSpec(specUrl, result)
        }
      })

    } catch (error) {
      console.error(`Failed to process docs URL ${docsUrl}:`, error)
    }
  }

  private async discoverApiResources(baseUrl: string, result: ScanResult): Promise<void> {
    const commonPaths = [
      '/docs',
      '/api-docs',
      '/api/docs',
      '/developer',
      '/developers', 
      '/documentation',
      '/swagger.json',
      '/openapi.json',
      '/openapi.yaml',
      '/api/swagger.json',
      '/api/openapi.json',
      '/v1/swagger.json',
      '/v1/openapi.json',
      '/v2/swagger.json',
      '/v2/openapi.json',
      '/api/v1/swagger.json',
      '/api/v1/openapi.json',
      '/api/v2/swagger.json',
      '/api/v2/openapi.json',
      '/.well-known/openapi.json',
      '/spec/openapi.json',
      '/spec/swagger.json'
    ]

    for (const path of commonPaths) {
      try {
        const fullUrl = `${baseUrl}${path}`
        const response = await fetch(fullUrl, { 
          timeout: 5000,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LLMs.txt Generator/1.0)' }
        })
        
        if (response.ok) {
          if (path.endsWith('.json') || path.endsWith('.yaml')) {
            // Potential OpenAPI spec
            await this.processOpenApiSpec(fullUrl, result)
          } else {
            // Potential documentation
            result.hasApiDocs = true
            if (!result.apiDocsUrls.includes(fullUrl)) {
              result.apiDocsUrls.push(fullUrl)
              await this.processDocsUrl(fullUrl, result)
            }
          }
        }
      } catch (error) {
        // Ignore errors for discovery
        continue
      }
    }
  }

  private extractCapabilities(text: string, result: ScanResult): void {
    const capabilityPatterns = {
      'database': ['database', 'db', 'sql', 'nosql', 'query', 'data storage'],
      'analytics': ['analytics', 'metrics', 'tracking', 'reporting', 'insights'],
      'authentication': ['auth', 'login', 'oauth', 'jwt', 'token', 'identity'],
      'payment': ['payment', 'billing', 'stripe', 'transaction', 'subscription'],
      'messaging': ['message', 'email', 'sms', 'notification', 'webhook'],
      'search': ['search', 'elasticsearch', 'indexing', 'full-text'],
      'ml': ['machine learning', 'ai', 'model', 'prediction'],
      'storage': ['storage', 'file', 'blob', 'object storage', 's3'],
      'api': ['api', 'rest', 'graphql', 'endpoint', 'integration']
    }

    Object.entries(capabilityPatterns).forEach(([capability, patterns]) => {
      if (patterns.some(pattern => text.includes(pattern))) {
        result.capabilities.push(capability)
      }
    })
  }

  private extractTechnologies(html: string, result: ScanResult): void {
    const techPatterns = [
      'react', 'vue', 'angular', 'node.js', 'python', 'java', 'golang', 'rust',
      'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
      'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'typescript', 'javascript'
    ]

    techPatterns.forEach(tech => {
      if (html.includes(tech)) {
        result.technologies.push(tech)
      }
    })
  }

  private detectApiDocumentation(bodyText: string, htmlContent: string, result: ScanResult): void {
    const apiIndicators = [
      'api documentation', 'rest api', 'graphql', 'swagger', 'openapi',
      'endpoint', 'authentication', 'rate limit'
    ]

    if (apiIndicators.some(indicator => bodyText.includes(indicator))) {
      result.hasApiDocs = true
    }

    if (htmlContent.includes('swagger') || htmlContent.includes('openapi')) {
      result.hasOpenApiSpec = true
    }
  }

  private extractApiEndpoints(text: string, result: ScanResult): void {
    const endpointRegex = /(GET|POST|PUT|DELETE|PATCH)\s+([\/\w\-\{\}]+)/gi
    const matches = text.match(endpointRegex) || []

    matches.forEach(match => {
      const [, method, path] = match.match(/(GET|POST|PUT|DELETE|PATCH)\s+(.+)/i) || []
      if (method && path) {
        result.endpoints.push({
          method,
          path,
          summary: `${method} operation on ${path}`,
          source: 'docs_extraction'
        } as any)
      }
    })
  }

  private extractCodeExamples(content: string, result: ScanResult): void {
    const codeBlockRegex = /```[\s\S]*?```/g
    const matches = content.match(codeBlockRegex) || []

    matches.forEach((block, index) => {
      const cleanBlock = block.replace(/```/g, '').trim()
      if (cleanBlock.length > 20) {
        result.useCases.push({
          type: 'code_example',
          content: cleanBlock,
          source: 'documentation'
        })
      }
    })
  }

  private async discoverSubdomains(baseUrl: string, result: ScanResult): Promise<void> {
    try {
      const url = new URL(baseUrl)
      const domain = url.hostname
      const parts = domain.split('.')
      
      // Skip if already a subdomain or IP
      if (parts.length > 2 || /^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
        return
      }
      
      // Common API subdomains
      const commonSubdomains = [
        'api', 'apis', 'api-v1', 'api-v2', 'v1', 'v2', 'v3',
        'developer', 'developers', 'dev',
        'docs', 'documentation',
        'platform', 'app',
        'admin', 'manage', 'console',
        'auth', 'oauth', 'login',
        'data', 'analytics', 'metrics',
        'sandbox', 'staging', 'demo'
      ]
      
      const rootDomain = parts.slice(-2).join('.')
      
      for (const sub of commonSubdomains) {
        const subdomain = `${sub}.${rootDomain}`
        try {
          const response = await fetch(`https://${subdomain}`, {
            timeout: 3000,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LLMs.txt Generator/1.0)' }
          })
          
          if (response.ok) {
            result.subdomains.push(subdomain)
            
            // Extract rate limits from headers
            const rateLimit = response.headers.get('x-ratelimit-limit')
            const rateLimitRemaining = response.headers.get('x-ratelimit-remaining')
            const rateLimitReset = response.headers.get('x-ratelimit-reset')
            
            if (rateLimit) {
              result.rateLimits = {
                ...result.rateLimits,
                default: `${rateLimit} requests per window`
              }
            }
          }
        } catch (error) {
          // Subdomain doesn't exist or timed out
          continue
        }
      }
    } catch (error) {
      console.error('Failed to discover subdomains:', error)
    }
  }

  private extractRateLimits(text: string, result: ScanResult): void {
    // Common rate limit patterns
    const patterns = [
      /(\d+)\s*requests?\s*per\s*(second|minute|hour|day)/gi,
      /rate\s*limit[:\s]+(\d+)\s*\/?(\w+)/gi,
      /(\d+)\s*API\s*calls?\s*per\s*(\w+)/gi,
      /quota[:\s]+(\d+)\s*per\s*(\w+)/gi
    ]
    
    patterns.forEach(pattern => {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        const [, count, period] = match
        if (!result.rateLimits?.default) {
          result.rateLimits = {
            ...result.rateLimits,
            default: `${count} per ${period}`
          }
        }
      }
    })
  }
}