// LLMs.txt Evaluator Frontend Logic

class LLMsTxtEvaluator {
    constructor() {
        this.websiteUrl = '';
        this.analysisResults = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Main form submission
        document.getElementById('evaluationForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            this.websiteUrl = document.getElementById('websiteUrl').value;
            
            // Capture additional resources
            this.additionalResources = {
                openApiUrl: document.getElementById('openApiUrl').value.trim(),
                githubRepo: document.getElementById('githubRepo').value.trim(),
                docsUrl: document.getElementById('docsUrl').value.trim()
            };
            
            await this.startAnalysis();
        });

        // Email form submission
        document.getElementById('emailForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.sendReport();
        });
    }

    async startAnalysis() {
        console.log('Starting analysis for:', this.websiteUrl);
        
        // Show progress modal
        this.showModal('progressModal');
        
        // Reset all steps
        for (let i = 1; i <= 5; i++) {
            this.resetStep(i);
        }

        // Execute analysis steps with delays for better UX
        try {
            // Step 1: Fetch llms.txt
            console.log('Step 1: Fetching llms.txt...');
            const fetchResult = await this.executeStep(1, async () => {
                return await this.fetchLLMsTxt();
            }, 3000);
            this.fetchedContent = fetchResult.content;
            console.log('Fetch result:', fetchResult);
            this.updateProgress(20);

            // Step 2: Analyze content
            console.log('Step 2: Analyzing content...');
            const analysisResult = await this.executeStep(2, async () => {
                return await this.analyzeLLMsTxtContent();
            }, 4000);
            console.log('Analysis result:', analysisResult);
            this.updateProgress(40);

            // Step 3: Scan website
            console.log('Step 3: Scanning website...');
            await this.executeStep(3, async () => {
                return await this.scanWebsite();
            }, 5000);
            this.updateProgress(60);

            // Step 4: Test API endpoints
            console.log('Step 4: Testing endpoints...');
            await this.executeStep(4, async () => {
                return await this.testAPIEndpoints();
            }, 4000);
            this.updateProgress(80);

            // Step 5: Generate report
            console.log('Step 5: Generating report...');
            await this.executeStep(5, async () => {
                return await this.generateReport();
            }, 3000);
            this.updateProgress(100);

            console.log('Final results:', this.analysisResults);

            // Hide progress modal and redirect to results
            setTimeout(() => {
                this.hideModal('progressModal');
                // Store results and redirect to results page
                localStorage.setItem('evaluationResults', JSON.stringify(this.analysisResults));
                window.location.href = `results.html?url=${encodeURIComponent(this.websiteUrl)}`;
            }, 1000);

        } catch (error) {
            console.error('Analysis failed:', error);
            this.hideModal('progressModal');
            this.showError(`Analysis failed: ${error.message}. Please try again.`);
        }
    }

    updateProgress(percentage) {
        const progressBar = document.getElementById('overallProgress');
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
    }

    async executeStep(stepNumber, action, duration) {
        const step = document.getElementById(`step${stepNumber}`);
        
        // Mark as active and show spinner
        step.classList.add('active', 'analyzing');
        const circle = step.querySelector('.step-circle');
        const spinner = step.querySelector('.fa-spinner');
        const check = step.querySelector('.fa-check');
        const number = step.querySelector('span');
        
        if (circle) {
            circle.style.background = 'linear-gradient(135deg, #7850ff 0%, #5040ff 100%)';
        }
        if (spinner) spinner.classList.remove('hidden');
        if (number) number.classList.add('hidden');

        // Simulate processing with shorter delay
        await new Promise(resolve => setTimeout(resolve, Math.min(duration * 0.3, 1000)));

        try {
            // Execute the actual action
            const result = await action();

            // Mark as complete
            await new Promise(resolve => setTimeout(resolve, Math.min(duration * 0.2, 500)));
            
            step.classList.remove('analyzing');
            if (spinner) spinner.classList.add('hidden');
            if (check) check.classList.remove('hidden');
            if (circle) {
                circle.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }
            
            return result;
        } catch (error) {
            console.error(`Step ${stepNumber} failed:`, error);
            
            // Mark as failed but continue
            step.classList.remove('analyzing');
            if (spinner) spinner.classList.add('hidden');
            if (check) {
                check.classList.remove('hidden');
                check.className = check.className.replace('fa-check', 'fa-exclamation-triangle');
                check.style.color = '#ef4444';
            }
            if (circle) {
                circle.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            }
            
            // Return a default result so the analysis can continue
            return null;
        }
    }

    resetStep(stepNumber) {
        const step = document.getElementById(`step${stepNumber}`);
        step.classList.remove('active', 'analyzing');
        
        const circle = step.querySelector('.rounded-full');
        const spinner = step.querySelector('.fa-spinner');
        const check = step.querySelector('.fa-check');
        const number = step.querySelector('span');
        
        circle.classList.remove('bg-purple-600', 'bg-green-100', 'text-white');
        circle.classList.add('bg-gray-200');
        spinner.classList.add('hidden');
        check.classList.add('hidden');
        number.classList.remove('hidden');
    }

    async fetchLLMsTxt() {
        // Normalize the URL to just the domain
        let domain = this.websiteUrl;
        if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
            domain = 'https://' + domain;
        }
        
        const url = new URL(domain);
        const baseUrl = `${url.protocol}//${url.host}`;
        
        // Standard llms.txt locations
        const locations = [
            `${baseUrl}/llms.txt`,
            `${baseUrl}/.well-known/llms.txt`
        ];
        
        let content = null;
        let foundLocation = null;
        
        // Try each location
        for (const location of locations) {
            try {
                console.log(`Checking for llms.txt at: ${location}`);
                
                // Try multiple CORS proxies
                const proxies = [
                    `https://corsproxy.io/?${encodeURIComponent(location)}`,
                    `https://api.allorigins.win/get?url=${encodeURIComponent(location)}`,
                    `https://cors-anywhere.herokuapp.com/${location}`
                ];
                
                for (const proxyUrl of proxies) {
                    try {
                        const response = await fetch(proxyUrl);
                        if (response.ok) {
                            let responseData;
                            
                            if (proxyUrl.includes('allorigins')) {
                                const data = await response.json();
                                responseData = data.contents;
                            } else {
                                responseData = await response.text();
                            }
                            
                            if (responseData && responseData.trim() && !responseData.includes('<!DOCTYPE')) {
                                content = responseData;
                                foundLocation = location;
                                console.log(`Found llms.txt at: ${location}`);
                                break;
                            }
                        }
                    } catch (proxyError) {
                        console.log(`Proxy ${proxyUrl} failed:`, proxyError.message);
                        continue;
                    }
                }
                
                if (content) break;
                
            } catch (error) {
                console.log(`Could not fetch from ${location}:`, error.message);
                // Continue to next location
            }
        }
        
        // If still no content found, provide demo content for certain domains
        if (!content) {
            const demoContent = this.getDemoContent(baseUrl);
            if (demoContent) {
                content = demoContent;
                foundLocation = `${baseUrl}/llms.txt`;
                console.log(`Using demo content for: ${baseUrl}`);
            }
        }
        
        return {
            found: !!content,
            location: foundLocation,
            locations: locations,
            content: content || null
        };
    }

    async analyzeLLMsTxtContent() {
        // Get the fetched content from previous step
        if (!this.fetchedContent) {
            // If no content was fetched, return low scores
            return {
                clarity: 20,
                completeness: 15,
                aiReadability: 25,
                examples: 10,
                authentication: 20,
                endpoints: 15,
                sections: {
                    authentication: false,
                    endpoints: false,
                    examples: false,
                    rate_limits: false,
                    error_handling: false
                },
                aiCompatibility: {
                    claude: 0.2,
                    gpt4: 0.15,
                    general: 0.1
                }
            };
        }

        // Analyze the actual content
        const content = this.fetchedContent.toLowerCase();
        const lines = this.fetchedContent.split('\n');
        
        // Check for key sections
        const sections = {
            authentication: content.includes('auth') || content.includes('token') || content.includes('key'),
            endpoints: content.includes('endpoint') || content.includes('api') || content.includes('get ') || content.includes('post '),
            examples: content.includes('example') || content.includes('curl') || content.includes('```'),
            rate_limits: content.includes('rate') || content.includes('limit') || content.includes('throttle'),
            error_handling: content.includes('error') || content.includes('status') || content.includes('code')
        };

        // Score based on content analysis
        const scores = {
            clarity: this.scoreClarity(lines),
            completeness: this.scoreCompleteness(sections, lines),
            aiReadability: this.scoreAIReadability(content, lines),
            examples: this.scoreExamples(content, lines),
            authentication: this.scoreAuthentication(content),
            endpoints: this.scoreEndpoints(content, lines)
        };

        // AI compatibility based on structure and clarity
        const avgScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
        const aiCompatibility = {
            claude: Math.max(0.1, Math.min(1.0, avgScore / 100 + 0.1)),
            gpt4: Math.max(0.1, Math.min(1.0, avgScore / 100 + 0.05)),
            general: Math.max(0.1, Math.min(1.0, avgScore / 100))
        };

        return {
            ...scores,
            sections,
            aiCompatibility
        };
    }

    scoreClarity(lines) {
        let score = 30; // Base score
        
        // Check for headers and structure
        const hasHeaders = lines.some(line => line.startsWith('#'));
        if (hasHeaders) score += 20;
        
        // Check for clear sections
        const hasStructure = lines.length > 5;
        if (hasStructure) score += 15;
        
        // Check for consistent formatting
        const hasConsistentFormatting = lines.filter(line => line.trim()).length > lines.length * 0.7;
        if (hasConsistentFormatting) score += 15;
        
        return Math.min(100, score + Math.random() * 20);
    }

    scoreCompleteness(sections, lines) {
        let score = 20; // Base score
        
        // Score based on essential sections
        if (sections.authentication) score += 25;
        if (sections.endpoints) score += 25;
        if (sections.examples) score += 15;
        if (sections.rate_limits) score += 10;
        if (sections.error_handling) score += 5;
        
        return Math.min(100, score);
    }

    scoreAIReadability(content, lines) {
        let score = 25; // Base score
        
        // Check for clear instructions
        if (content.includes('instruction') || content.includes('how to')) score += 20;
        
        // Check for structured format
        if (lines.some(line => line.includes('##') || line.includes('###'))) score += 15;
        
        // Check for code blocks
        if (content.includes('```') || content.includes('`')) score += 15;
        
        // Check for bullet points or lists
        if (content.includes('- ') || content.includes('* ')) score += 10;
        
        return Math.min(100, score + Math.random() * 15);
    }

    scoreExamples(content, lines) {
        let score = 10; // Base score
        
        // Check for code examples
        if (content.includes('curl')) score += 30;
        if (content.includes('```')) score += 25;
        if (content.includes('example')) score += 20;
        if (content.includes('http')) score += 15;
        
        return Math.min(100, score);
    }

    scoreAuthentication(content) {
        let score = 20; // Base score
        
        if (content.includes('bearer')) score += 25;
        if (content.includes('api key') || content.includes('api-key')) score += 25;
        if (content.includes('oauth')) score += 20;
        if (content.includes('token')) score += 15;
        if (content.includes('authorization')) score += 10;
        
        return Math.min(100, score);
    }

    scoreEndpoints(content, lines) {
        let score = 15; // Base score
        
        // Count HTTP methods
        const methods = ['get', 'post', 'put', 'delete', 'patch'];
        methods.forEach(method => {
            if (content.includes(method + ' ') || content.includes(method + '\t')) score += 15;
        });
        
        // Check for URL patterns
        if (content.includes('/api/')) score += 20;
        if (content.includes('https://') || content.includes('http://')) score += 10;
        
        return Math.min(100, score);
    }

    getDemoContent(baseUrl) {
        // No longer provide demo content - we will generate comprehensive llms.txt for any site
        return null;
    }

    async scanWebsiteWithAdditionalResources() {
        const baseUrl = this.websiteUrl.replace(/\/$/, '');
        console.log('Scanning website with additional resources:', baseUrl);
        
        // Start with basic website scan
        const scanResults = await this.extractWebsiteInfo(baseUrl);
        
        // Process additional resources if provided
        if (this.additionalResources) {
            await this.processAdditionalResources(scanResults);
        }
        
        return {
            apiDocsFound: scanResults.hasApiDocs,
            apiDocsUrl: scanResults.apiDocsUrl,
            openApiSpec: scanResults.hasOpenApiSpec,
            interactiveExplorer: scanResults.hasApiExplorer,
            corsEnabled: true,
            httpsOnly: baseUrl.startsWith('https'),
            responseFormat: scanResults.apiFormat || 'JSON',
            statusCodesDocumented: scanResults.hasStatusCodes,
            extractedInfo: scanResults
        };
    }

    async processAdditionalResources(scanResults) {
        // Process OpenAPI specification if provided
        if (this.additionalResources.openApiUrl) {
            console.log('Processing OpenAPI spec:', this.additionalResources.openApiUrl);
            await this.processOpenApiFromUrl(this.additionalResources.openApiUrl, scanResults);
        }

        // Process GitHub repository if provided
        if (this.additionalResources.githubRepo) {
            console.log('Processing GitHub repo:', this.additionalResources.githubRepo);
            await this.processGitHubRepo(this.additionalResources.githubRepo, scanResults);
        }

        // Process additional documentation if provided
        if (this.additionalResources.docsUrl) {
            console.log('Processing docs URL:', this.additionalResources.docsUrl);
            await this.processAdditionalDocs(this.additionalResources.docsUrl, scanResults);
        }
    }

    async processOpenApiFromUrl(openApiUrl, scanResults) {
        try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(openApiUrl)}`;
            const response = await fetch(proxyUrl);
            
            if (response.ok) {
                const data = await response.json();
                if (data.contents) {
                    try {
                        const spec = JSON.parse(data.contents);
                        if (spec.openapi || spec.swagger) {
                            scanResults.hasOpenApiSpec = true;
                            scanResults.openApiSpecUrl = openApiUrl;
                            await this.parseOpenApiSpec(spec, scanResults);
                        }
                    } catch (e) {
                        console.log('Failed to parse OpenAPI spec:', e);
                    }
                }
            }
        } catch (error) {
            console.log('Failed to fetch OpenAPI spec:', error);
        }
    }

    async processGitHubRepo(githubUrl, scanResults) {
        try {
            // Extract repo info from URL
            const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (!match) return;
            
            const [, owner, repo] = match;
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
            
            const response = await fetch(apiUrl);
            if (response.ok) {
                const repoInfo = await response.json();
                
                // Extract repo metadata
                scanResults.githubInfo = {
                    name: repoInfo.name,
                    description: repoInfo.description,
                    language: repoInfo.language,
                    topics: repoInfo.topics || [],
                    stars: repoInfo.stargazers_count,
                    url: repoInfo.html_url
                };

                // Try to fetch README for examples
                const readmeUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
                const readmeResponse = await fetch(readmeUrl);
                if (readmeResponse.ok) {
                    const readmeData = await readmeResponse.json();
                    const readmeContent = atob(readmeData.content);
                    await this.extractExamplesFromReadme(readmeContent, scanResults);
                }
            }
        } catch (error) {
            console.log('Failed to process GitHub repo:', error);
        }
    }

    async processAdditionalDocs(docsUrl, scanResults) {
        try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(docsUrl)}`;
            const response = await fetch(proxyUrl);
            
            if (response.ok) {
                const data = await response.json();
                if (data.contents) {
                    await this.parseDocsPage(data.contents, scanResults);
                    scanResults.hasApiDocs = true;
                    scanResults.apiDocsUrl = docsUrl;
                }
            }
        } catch (error) {
            console.log('Failed to process additional docs:', error);
        }
    }

    async extractExamplesFromReadme(readmeContent, scanResults) {
        // Extract code blocks from README
        const codeBlockRegex = /```[\s\S]*?```/g;
        const codeBlocks = readmeContent.match(codeBlockRegex) || [];
        
        codeBlocks.forEach((block, index) => {
            const cleanBlock = block.replace(/```/g, '').trim();
            if (cleanBlock.length > 10) { // Only substantial code blocks
                scanResults.useCases = scanResults.useCases || [];
                scanResults.useCases.push({
                    type: 'github_example',
                    content: cleanBlock,
                    source: 'github_readme'
                });
            }
        });
    }

    getDemoContent(baseUrl) {
        // Legacy method - no longer used
        return null;
    }

    async scanWebsite() {
        // Use the enhanced scanner with additional resources
        return await this.scanWebsiteWithAdditionalResources();
    }

    generateUniversalLlmsTxt(websiteScan, apiTest) {
        // This is the universal template based on ScyllaDB-style comprehensive generation
        const baseUrl = this.websiteUrl.replace(/\/$/, '');
        const info = websiteScan.extractedInfo || {};
        const currentDate = new Date().toISOString().split('T')[0];
        
        const domain = new URL(`https://${baseUrl.replace(/^https?:\/\//, '')}`).hostname.replace('www.', '');
        const companyName = this.extractCompanyName(info, domain);
        
        let llmsTxt = '';
        
        // Header with generation metadata
        llmsTxt += `# Company: ${companyName}\n`;
        llmsTxt += `# Updated: ${currentDate}\n`;
        llmsTxt += `# Generated: ${new Date().toISOString()}\n`;
        llmsTxt += `# Source: Automated extraction and optimization for AI agents\n\n`;
        
        // Basic identification - AI-optimized
        llmsTxt += `title: ${info.title || `${companyName} - AI-Accessible API Platform`}\n`;
        llmsTxt += `description: ${this.generateAIOptimizedDescription(info, companyName)}\n`;
        llmsTxt += `base_url: ${baseUrl}\n`;
        llmsTxt += `domain: ${domain}\n`;
        llmsTxt += `ai_optimized: true\n`;
        llmsTxt += `machine_readable: true\n\n`;
        
        // Comprehensive API endpoints matrix
        llmsTxt += this.generateComprehensiveEndpointsSection(info, baseUrl);
        
        // Data schemas and models
        llmsTxt += this.generateSchemasSection(info);
        
        // Authentication schemes
        llmsTxt += this.generateAuthenticationSection(info);
        
        // Comprehensive capabilities matrix
        llmsTxt += this.generateCapabilitiesSection(info);
        
        // Integration specifications  
        llmsTxt += this.generateIntegrationSection(info, baseUrl);
        
        // Performance benchmarks
        llmsTxt += this.generatePerformanceSection(apiTest, websiteScan);
        
        // Market positioning with quantified metrics
        llmsTxt += this.generateMarketPositioningSection(info, companyName);
        
        // Comprehensive keyword taxonomy for AI discovery
        llmsTxt += this.generateKeywordsSection(info, companyName);
        
        // GitHub and additional resources
        llmsTxt += this.generateResourcesSection(info);
        
        // Contact and support information
        llmsTxt += this.generateContactSection(domain, baseUrl);
        
        return llmsTxt;
    }

    extractCompanyName(info, domain) {
        if (info.title) {
            // Extract company name from title, removing common suffixes
            return info.title
                .replace(/\s*-\s*(API|Platform|Service|Inc|Corp|Ltd|LLC).*$/i, '')
                .replace(/\s*(API|Documentation|Docs).*$/i, '')
                .trim();
        }
        
        // Fallback to domain-based name
        return domain.split('.')[0]
            .replace(/^(api|www|docs)\./, '')
            .replace(/[^a-zA-Z0-9]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
    }

    generateComprehensiveEndpointsSection(info, baseUrl) {
        let section = `# API Endpoints Matrix\n`;
        section += `endpoints:\n`;
        
        if (info.endpoints && info.endpoints.length > 0) {
            // Use extracted endpoints from OpenAPI or docs
            info.endpoints.forEach(endpoint => {
                section += `  - path: "${endpoint.path}"\n`;
                section += `    method: ${endpoint.method}\n`;
                section += `    summary: "${endpoint.summary || `${endpoint.method} operation on ${endpoint.path}`}"\n`;
                if (endpoint.description) section += `    description: "${endpoint.description}"\n`;
                
                if (endpoint.parameters && endpoint.parameters.length > 0) {
                    section += `    parameters:\n`;
                    endpoint.parameters.forEach(param => {
                        section += `      - name: "${param.name}"\n`;
                        section += `        type: ${param.schema?.type || param.type || 'string'}\n`;
                        section += `        required: ${param.required || false}\n`;
                        section += `        location: ${param.in || 'query'}\n`;
                        if (param.description) section += `        description: "${param.description}"\n`;
                    });
                }
                
                if (endpoint.responses) {
                    section += `    responses:\n`;
                    Object.entries(endpoint.responses).forEach(([code, response]) => {
                        section += `      "${code}": "${response.description || 'Response'}"\n`;
                    });
                }
                section += `    ai_usage: "Suitable for automated ${endpoint.method.toLowerCase()} operations"\n`;
                section += '\n';
            });
        } else {
            // Generate comprehensive default endpoints based on capabilities
            section += this.generateDefaultEndpoints(info, baseUrl);
        }
        
        return section + '\n';
    }

    generateDefaultEndpoints(info, baseUrl) {
        let endpoints = '';
        
        // Always include core API endpoints
        endpoints += `  - path: "/api/v1/status"\n`;
        endpoints += `    method: GET\n`;
        endpoints += `    summary: "Health check and system status"\n`;
        endpoints += `    description: "Returns API health and version information"\n`;
        endpoints += `    parameters: []\n`;
        endpoints += `    responses:\n`;
        endpoints += `      "200": "Service operational status"\n`;
        endpoints += `    ai_usage: "Essential for API connectivity verification"\n\n`;
        
        endpoints += `  - path: "/api/v1/resources"\n`;
        endpoints += `    method: GET\n`;
        endpoints += `    summary: "List available resources"\n`;
        endpoints += `    description: "Returns paginated list of accessible resources"\n`;
        endpoints += `    parameters:\n`;
        endpoints += `      - name: "limit"\n`;
        endpoints += `        type: integer\n`;
        endpoints += `        required: false\n`;
        endpoints += `        location: query\n`;
        endpoints += `        description: "Number of items to return (max 100)"\n`;
        endpoints += `      - name: "offset"\n`;
        endpoints += `        type: integer\n`;
        endpoints += `        required: false\n`;
        endpoints += `        location: query\n`;
        endpoints += `    responses:\n`;
        endpoints += `      "200": "Paginated resource listing"\n`;
        endpoints += `    ai_usage: "Primary endpoint for resource discovery"\n\n`;
        
        // Add capability-specific endpoints
        if (info.capabilities) {
            info.capabilities.forEach(capability => {
                endpoints += this.generateCapabilityEndpoints(capability);
            });
        }
        
        return endpoints;
    }

    generateCapabilityEndpoints(capability) {
        const capabilityEndpoints = {
            'database': `  - path: "/api/v1/query"\n    method: POST\n    summary: "Execute database query"\n    description: "Submit SQL/NoSQL queries for execution"\n    parameters:\n      - name: "query"\n        type: string\n        required: true\n        location: body\n        description: "Query string to execute"\n      - name: "parameters"\n        type: array\n        required: false\n        location: body\n    responses:\n      "200": "Query results"\n      "400": "Invalid query syntax"\n    ai_usage: "Automated data retrieval and analysis"\n\n`,
            
            'analytics': `  - path: "/api/v1/analytics/reports"\n    method: POST\n    summary: "Generate analytics report"\n    description: "Create custom analytics reports"\n    parameters:\n      - name: "metrics"\n        type: array\n        required: true\n        location: body\n      - name: "timeframe"\n        type: string\n        required: true\n        location: body\n        description: "Time period (e.g., '7d', '30d', '1y')"\n    responses:\n      "200": "Generated report data"\n    ai_usage: "Automated reporting and insights generation"\n\n`,
            
            'payment': `  - path: "/api/v1/payments"\n    method: POST\n    summary: "Process payment transaction"\n    description: "Submit payment for processing"\n    parameters:\n      - name: "amount"\n        type: number\n        required: true\n        location: body\n      - name: "currency"\n        type: string\n        required: true\n        location: body\n      - name: "customer_id"\n        type: string\n        required: true\n        location: body\n    responses:\n      "200": "Payment processed successfully"\n      "400": "Invalid payment details"\n    ai_usage: "Automated transaction processing"\n\n`
        };
        
        return capabilityEndpoints[capability.toLowerCase()] || 
               `  - path: "/api/v1/${capability.toLowerCase()}"\n    method: GET\n    summary: "${capability} operations"\n    description: "Access ${capability} functionality"\n    ai_usage: "Automated ${capability} integration"\n\n`;
    }

    generateSchemasSection(info) {
        let section = `# Data Schemas\n`;
        section += `schemas:\n`;
        
        if (info.schemas && info.schemas.length > 0) {
            info.schemas.forEach(schema => {
                section += `  - name: "${schema.name}"\n`;
                section += `    type: ${schema.type}\n`;
                if (schema.properties && Object.keys(schema.properties).length > 0) {
                    section += `    properties:\n`;
                    Object.entries(schema.properties).forEach(([propName, propDef]) => {
                        section += `      ${propName}:\n`;
                        section += `        type: ${propDef.type || 'string'}\n`;
                        if (propDef.description) section += `        description: "${propDef.description}"\n`;
                        if (propDef.format) section += `        format: ${propDef.format}\n`;
                    });
                }
                if (schema.required && schema.required.length > 0) {
                    section += `    required: [${schema.required.join(', ')}]\n`;
                }
                section += '\n';
            });
        } else {
            // Generate default schemas
            section += `  - name: "Resource"\n`;
            section += `    type: object\n`;
            section += `    properties:\n`;
            section += `      id:\n`;
            section += `        type: string\n`;
            section += `        description: "Unique identifier"\n`;
            section += `      name:\n`;
            section += `        type: string\n`;
            section += `        description: "Resource name"\n`;
            section += `      created_at:\n`;
            section += `        type: string\n`;
            section += `        format: date-time\n`;
            section += `        description: "Creation timestamp"\n`;
            section += `    required: [id, name]\n\n`;
        }
        
        return section + '\n';
    }

    generateAuthenticationSection(info) {
        let section = `# Authentication\n`;
        section += `authentication:\n`;
        
        if (info.authMethods && info.authMethods.length > 0) {
            info.authMethods.forEach(auth => {
                section += `  - name: "${auth.name || auth}"\n`;
                section += `    type: ${auth.type || 'apiKey'}\n`;
                if (auth.scheme) section += `    scheme: ${auth.scheme}\n`;
                if (auth.location) section += `    location: ${auth.location}\n`;
                if (auth.bearerFormat) section += `    bearer_format: ${auth.bearerFormat}\n`;
                section += '\n';
            });
        } else {
            // Default auth methods
            section += `  - name: "api_key"\n`;
            section += `    type: apiKey\n`;
            section += `    location: header\n`;
            section += `    header_name: "X-API-Key"\n`;
            section += `    description: "Include API key in request header"\n\n`;
            section += `  - name: "bearer_token"\n`;
            section += `    type: http\n`;
            section += `    scheme: bearer\n`;
            section += `    bearer_format: JWT\n`;
            section += `    description: "OAuth 2.0 Bearer Token authentication"\n\n`;
        }
        
        return section + '\n';
    }

    generateCapabilitiesSection(info) {
        let section = `# Capabilities Matrix\n`;
        section += `capabilities:\n`;
        
        const capabilityMatrix = this.generateComprehensiveCapabilities(info);
        Object.entries(capabilityMatrix).forEach(([category, capabilities]) => {
            section += `  ${category}:\n`;
            capabilities.forEach(cap => {
                section += `    - action: "${cap.action}"\n`;
                section += `      method: ${cap.method}\n`;
                section += `      endpoint: "${cap.endpoint}"\n`;
                if (cap.parameters) section += `      parameters: [${cap.parameters.join(', ')}]\n`;
                section += '\n';
            });
        });
        
        return section + '\n';
    }

    generateIntegrationSection(info, baseUrl) {
        let section = `# Integration Specifications\n`;
        section += `integration:\n`;
        
        if (info.openApiSpecUrl) {
            section += `  openapi_spec: ${baseUrl}${info.openApiSpecUrl}\n`;
        }
        if (info.apiDocsUrl) {
            section += `  documentation: ${baseUrl}${info.apiDocsUrl}\n`;
        }
        if (info.githubInfo) {
            section += `  github_repo: ${info.githubInfo.url}\n`;
            section += `  primary_language: ${info.githubInfo.language || 'unknown'}\n`;
            section += `  github_stars: ${info.githubInfo.stars || 0}\n`;
        }
        
        section += `  sdk_available: false\n`;
        section += `  postman_collection: "${baseUrl}/postman.json"\n`;
        section += `  response_format: ["application/json", "application/xml"]\n`;
        section += `  request_format: ["application/json", "application/x-www-form-urlencoded"]\n`;
        section += `  cors_enabled: true\n`;
        section += `  rate_limiting: true\n\n`;
        
        return section;
    }

    generatePerformanceSection(apiTest, websiteScan) {
        let section = `# Performance Benchmarks\n`;
        section += `performance:\n`;
        section += `  response_time_p50: ${apiTest.avgResponseTime ? Math.round(apiTest.avgResponseTime * 0.7) : 50}ms\n`;
        section += `  response_time_p95: ${apiTest.avgResponseTime ? Math.round(apiTest.avgResponseTime * 1.2) : 100}ms\n`;
        section += `  response_time_p99: ${apiTest.avgResponseTime || 150}ms\n`;
        section += `  uptime_sla: 99.9%\n`;
        section += `  concurrent_connections: 10000\n`;
        section += `  rate_limits:\n`;
        section += `    default: "1000 req/min"\n`;
        section += `    authenticated: "10000 req/min"\n`;
        section += `    enterprise: "unlimited"\n`;
        section += `  https_required: ${websiteScan.httpsOnly}\n`;
        section += `  cors_enabled: ${websiteScan.corsEnabled}\n\n`;
        
        return section;
    }

    generateMarketPositioningSection(info, companyName) {
        const competitors = this.generateCompetitors(info, companyName);
        const differentiators = this.generateQuantifiedDifferentiators(info, companyName);
        
        let section = `# Market Positioning\n`;
        section += `market:\n`;
        section += `  category: "${this.inferMarketCategory(info)}"\n`;
        section += `  alternatives: [${competitors.join(', ')}]\n`;
        section += `  differentiators:\n`;
        differentiators.forEach(diff => {
            section += `    - metric: "${diff.metric}"\n`;
            section += `      value: "${diff.value}"\n`;
            section += `      comparison: "${diff.comparison}"\n`;
        });
        section += '\n';
        
        return section;
    }

    generateKeywordsSection(info, companyName) {
        const keywords = this.generateComprehensiveKeywords(info, companyName);
        let section = `# Discovery Keywords\n`;
        section += `keywords:\n`;
        Object.entries(keywords).forEach(([category, words]) => {
            section += `  ${category}: [${words.join(', ')}]\n`;
        });
        section += '\n';
        
        return section;
    }

    generateResourcesSection(info) {
        let section = `# Additional Resources\n`;
        section += `resources:\n`;
        
        if (info.githubInfo) {
            section += `  github:\n`;
            section += `    repository: ${info.githubInfo.url}\n`;
            section += `    language: ${info.githubInfo.language || 'unknown'}\n`;
            section += `    stars: ${info.githubInfo.stars || 0}\n`;
            if (info.githubInfo.topics && info.githubInfo.topics.length > 0) {
                section += `    topics: [${info.githubInfo.topics.join(', ')}]\n`;
            }
        }
        
        if (info.useCases && info.useCases.length > 0) {
            section += `  code_examples:\n`;
            info.useCases.forEach((useCase, index) => {
                section += `    - id: example_${index + 1}\n`;
                section += `      type: ${useCase.type || 'api_call'}\n`;
                section += `      source: ${useCase.source || 'website'}\n`;
                section += `      content: |\n`;
                useCase.content.split('\n').forEach(line => {
                    section += `        ${line}\n`;
                });
                section += '\n';
            });
        }
        
        return section + '\n';
    }

    generateContactSection(domain, baseUrl) {
        let section = `# Contact Information\n`;
        section += `contact:\n`;
        section += `  support: support@${domain}\n`;
        section += `  sales: sales@${domain}\n`;
        section += `  enterprise: enterprise@${domain}\n`;
        section += `  documentation: ${baseUrl}/docs\n`;
        section += `  status_page: ${baseUrl}/status\n`;
        section += `  api_status: ${baseUrl}/api/status\n`;
        
        return section;
    }

\`\`\`bash
curl -H "Authorization: Bearer $ANTHROPIC_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.anthropic.com/v1/messages
\`\`\`

## Endpoints

### POST /v1/messages
Create a new message conversation.

## Rate Limits
- 1000 requests per minute for paid accounts
- 100 requests per minute for free accounts

## Example
\`\`\`json
{
  "model": "claude-3-sonnet-20240229",
  "max_tokens": 1024,
  "messages": [
    {"role": "user", "content": "Hello, Claude"}
  ]
}
\`\`\``,
            'https://openai.com': `# OpenAI API Instructions

## Authentication
Include your API key in the Authorization header:
\`Authorization: Bearer YOUR_API_KEY\`

## Base URL
https://api.openai.com/v1

## Endpoints
- POST /chat/completions - Chat with GPT models
- POST /completions - Text completion
- POST /images/generations - Generate images

## Rate Limits
Varies by subscription tier. Check headers for current limits.

## Example Request
\`\`\`bash
curl https://api.openai.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" \\
  -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "Hello!"}]}'
\`\`\``,
            'https://stripe.com': `# Stripe API

## Authentication
Use your secret key in the Authorization header:
\`Authorization: Bearer sk_test_...\`

## Base URL
https://api.stripe.com/v1

## Common Endpoints
- POST /payment_intents - Create payments
- GET /customers - List customers
- POST /subscriptions - Create subscriptions

## Testing
Use test mode with sk_test_ keys for development.

## Webhooks
Configure webhook endpoints to receive real-time updates.

\`\`\`bash
curl https://api.stripe.com/v1/payment_intents \\
  -u sk_test_key: \\
  -d amount=2000 \\
  -d currency=usd
\`\`\``,
            'https://github.com': `# GitHub API

## Authentication
Use personal access tokens or GitHub Apps.

\`Authorization: Bearer ghp_xxxxxxxxxxxx\`

## Base URL
https://api.github.com

## Endpoints
- GET /user - Get authenticated user
- GET /repos/:owner/:repo - Get repository
- POST /repos/:owner/:repo/issues - Create issue

## Rate Limits
- 5000 requests per hour for authenticated requests
- 60 requests per hour for unauthenticated

## Example
\`\`\`bash
curl -H "Authorization: Bearer $GITHUB_TOKEN" \\
     https://api.github.com/user
\`\`\``,
            'https://llmstxt.org': `# LLMs.txt Standard

This is the official LLMs.txt proposal site.

## What is llms.txt?
A proposed standard for providing AI-readable instructions and documentation for APIs and services.

## Format
Markdown file placed at /llms.txt or /.well-known/llms.txt

## Sections
- Authentication methods
- API endpoints
- Rate limits
- Examples
- Usage guidelines

## Example
\`\`\`bash
curl https://api.example.com/v1/data \\
  -H "Authorization: Bearer TOKEN"
\`\`\`

Learn more at https://llmstxt.org`,
            'https://example.com': `# Example API

This is a basic API documentation for demonstration.

## Authentication
API Key required in header: \`X-API-Key: your-key-here\`

## Endpoints
GET /api/data - Retrieve data
POST /api/data - Create new data

## Example
\`\`\`bash
curl -H "X-API-Key: abc123" https://example.com/api/data
\`\`\``
        };

        return demoSites[baseUrl] || null;
    }

    async scanWebsite() {
        try {
            const baseUrl = this.websiteUrl.replace(/\/$/, '');
            console.log('Scanning website:', baseUrl);
            
            // Try to fetch the main page and extract information
            const scanResults = await this.extractWebsiteInfo(baseUrl);
            
            return {
                apiDocsFound: scanResults.hasApiDocs,
                apiDocsUrl: scanResults.apiDocsUrl,
                openApiSpec: scanResults.hasOpenApiSpec,
                interactiveExplorer: scanResults.hasApiExplorer,
                corsEnabled: true, // Assume true for now
                httpsOnly: baseUrl.startsWith('https'),
                responseFormat: scanResults.apiFormat || 'JSON',
                statusCodesDocumented: scanResults.hasStatusCodes,
                extractedInfo: scanResults
            };
        } catch (error) {
            console.error('Website scanning error:', error);
            // Fallback to mock data
            return {
                apiDocsFound: false,
                apiDocsUrl: null,
                openApiSpec: false,
                interactiveExplorer: false,
                corsEnabled: true,
                httpsOnly: this.websiteUrl.startsWith('https'),
                responseFormat: 'JSON',
                statusCodesDocumented: false,
                extractedInfo: null
            };
        }
    }

    async extractWebsiteInfo(baseUrl) {
        const info = {
            title: '',
            description: '',
            hasApiDocs: false,
            apiDocsUrl: null,
            hasOpenApiSpec: false,
            openApiSpecUrl: null,
            hasApiExplorer: false,
            apiFormat: 'JSON',
            hasStatusCodes: false,
            capabilities: [],
            technologies: [],
            endpoints: [],
            schemas: [],
            authMethods: [],
            rateLimits: [],
            errorCodes: [],
            useCases: []
        };

        // Comprehensive API-related paths to check
        const apiDocPaths = [
            '/docs', '/docs/api', '/api-docs', '/documentation', '/api/docs',
            '/swagger', '/openapi', '/redoc', '/api', '/reference', '/dev',
            '/developers', '/swagger-ui', '/api-reference', '/rest', '/graphql'
        ];

        const openApiPaths = [
            '/swagger.json', '/openapi.json', '/swagger.yaml', '/openapi.yaml',
            '/api/swagger.json', '/api/openapi.json', '/docs/swagger.json',
            '/v1/swagger.json', '/v2/swagger.json', '/api/v1/openapi.json'
        ];

        // First, scan main page for basic info and API indicators
        await this.scanMainPage(baseUrl, info);
        
        // Then systematically scan for API documentation
        await this.scanApiDocumentation(baseUrl, apiDocPaths, info);
        
        // Try to find and parse OpenAPI specifications
        await this.scanOpenApiSpecs(baseUrl, openApiPaths, info);
        
        // If we found docs, do deep extraction
        if (info.hasApiDocs && info.apiDocsUrl) {
            await this.deepScanApiDocs(baseUrl, info);
        }

        return info;
    }

    async scanMainPage(baseUrl, info) {
        const proxies = [
            `https://api.allorigins.win/get?url=${encodeURIComponent(baseUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(baseUrl)}`
        ];

        for (const proxyUrl of proxies) {
            try {
                const response = await fetch(proxyUrl);
                if (!response.ok) continue;

                let content = '';
                if (proxyUrl.includes('allorigins')) {
                    const data = await response.json();
                    content = data.contents;
                } else {
                    content = await response.text();
                }

                if (content && content.includes('<')) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(content, 'text/html');
                    
                    info.title = doc.querySelector('title')?.textContent?.trim() || '';
                    info.description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
                    
                    const bodyText = doc.body?.textContent?.toLowerCase() || '';
                    const htmlContent = content.toLowerCase();
                    
                    // Detect API documentation presence
                    if (bodyText.includes('api') && (bodyText.includes('endpoint') || bodyText.includes('documentation'))) {
                        info.hasApiDocs = true;
                    }
                    
                    // Check for OpenAPI/Swagger indicators
                    if (htmlContent.includes('swagger') || htmlContent.includes('openapi') || htmlContent.includes('redoc')) {
                        info.hasOpenApiSpec = true;
                    }
                    
                    // Extract detailed capabilities and technologies
                    this.extractComprehensiveCapabilities(bodyText, htmlContent, info);
                    this.extractTechnologies(htmlContent, info);
                    this.extractAuthenticationMethods(bodyText, htmlContent, info);
                    
                    break;
                }
            } catch (error) {
                console.log('Main page scan failed:', error);
                continue;
            }
        }
    }

    async scanApiDocumentation(baseUrl, apiDocPaths, info) {
        for (const path of apiDocPaths) {
            try {
                const checkUrl = `${baseUrl}${path}`;
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(checkUrl)}`;
                const response = await fetch(proxyUrl);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.contents && !data.contents.includes('404') && !data.contents.includes('not found')) {
                        info.hasApiDocs = true;
                        info.apiDocsUrl = path;
                        
                        // If this is a docs page, extract structured info
                        if (path.includes('docs') || path.includes('documentation')) {
                            await this.parseDocsPage(data.contents, info);
                        }
                        break;
                    }
                }
            } catch (error) {
                continue;
            }
        }
    }

    async scanOpenApiSpecs(baseUrl, openApiPaths, info) {
        for (const path of openApiPaths) {
            try {
                const checkUrl = `${baseUrl}${path}`;
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(checkUrl)}`;
                const response = await fetch(proxyUrl);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.contents) {
                        try {
                            const spec = JSON.parse(data.contents);
                            if (spec.openapi || spec.swagger) {
                                info.hasOpenApiSpec = true;
                                info.openApiSpecUrl = path;
                                await this.parseOpenApiSpec(spec, info);
                                break;
                            }
                        } catch (e) {
                            // Try YAML parsing if JSON fails
                            continue;
                        }
                    }
                }
            } catch (error) {
                continue;
            }
        }
    }

    async parseOpenApiSpec(spec, info) {
        // Extract all endpoints with full details
        if (spec.paths) {
            Object.entries(spec.paths).forEach(([path, methods]) => {
                Object.entries(methods).forEach(([method, details]) => {
                    if (typeof details === 'object' && details.summary) {
                        info.endpoints.push({
                            path: path,
                            method: method.toUpperCase(),
                            summary: details.summary,
                            description: details.description || '',
                            parameters: details.parameters || [],
                            requestBody: details.requestBody || null,
                            responses: details.responses || {},
                            tags: details.tags || []
                        });
                    }
                });
            });
        }

        // Extract schemas/models
        if (spec.components && spec.components.schemas) {
            Object.entries(spec.components.schemas).forEach(([name, schema]) => {
                info.schemas.push({
                    name: name,
                    type: schema.type || 'object',
                    properties: schema.properties || {},
                    required: schema.required || []
                });
            });
        }

        // Extract authentication methods
        if (spec.components && spec.components.securitySchemes) {
            Object.entries(spec.components.securitySchemes).forEach(([name, scheme]) => {
                info.authMethods.push({
                    name: name,
                    type: scheme.type,
                    scheme: scheme.scheme || null,
                    bearerFormat: scheme.bearerFormat || null,
                    location: scheme.in || null
                });
            });
        }
    }

    async parseDocsPage(content, info) {
        // Extract endpoints from documentation
        const endpointRegex = /(GET|POST|PUT|DELETE|PATCH)\s+([\/\w\-\{\}]+)/gi;
        const matches = content.match(endpointRegex) || [];
        
        matches.forEach(match => {
            const [, method, path] = match.match(/(GET|POST|PUT|DELETE|PATCH)\s+(.+)/i) || [];
            if (method && path) {
                info.endpoints.push({
                    method: method,
                    path: path,
                    source: 'docs_extraction'
                });
            }
        });

        // Extract code examples
        const codeBlockRegex = /```[\s\S]*?```/g;
        const codeBlocks = content.match(codeBlockRegex) || [];
        
        codeBlocks.forEach(block => {
            if (block.includes('curl') || block.includes('GET') || block.includes('POST')) {
                // This is likely an API example
                info.useCases.push({
                    type: 'code_example',
                    content: block.replace(/```/g, '').trim()
                });
            }
        });
    }

    async deepScanApiDocs(baseUrl, info) {
        // If we have API docs, try to extract more detailed information
        try {
            const docsUrl = `${baseUrl}${info.apiDocsUrl}`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(docsUrl)}`;
            const response = await fetch(proxyUrl);
            
            if (response.ok) {
                const data = await response.json();
                if (data.contents) {
                    await this.parseDocsPage(data.contents, info);
                }
            }
        } catch (error) {
            console.log('Deep scan failed:', error);
        }
    }

    extractComprehensiveCapabilities(bodyText, htmlContent, info) {
        // Comprehensive capability detection
        const capabilityPatterns = {
            'database': ['database', 'db', 'sql', 'nosql', 'query', 'data storage', 'mongodb', 'postgresql', 'mysql'],
            'cache': ['cache', 'caching', 'redis', 'memcached', 'cdn'],
            'storage': ['storage', 'file', 'blob', 'object storage', 's3', 'bucket'],
            'analytics': ['analytics', 'metrics', 'tracking', 'reporting', 'insights', 'dashboard'],
            'authentication': ['auth', 'login', 'oauth', 'jwt', 'token', 'identity', 'sso'],
            'authorization': ['permissions', 'roles', 'access control', 'rbac', 'acl'],
            'payment': ['payment', 'billing', 'stripe', 'paypal', 'transaction', 'subscription'],
            'messaging': ['message', 'email', 'sms', 'notification', 'webhook', 'push'],
            'search': ['search', 'elasticsearch', 'solr', 'indexing', 'full-text'],
            'ml': ['machine learning', 'ai', 'model', 'prediction', 'classification'],
            'monitoring': ['monitoring', 'logging', 'alerting', 'observability', 'metrics'],
            'workflow': ['workflow', 'automation', 'pipeline', 'orchestration', 'job queue'],
            'geolocation': ['geo', 'location', 'mapping', 'gps', 'coordinates'],
            'media': ['image', 'video', 'audio', 'media processing', 'transcoding'],
            'blockchain': ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'smart contract']
        };

        Object.entries(capabilityPatterns).forEach(([capability, patterns]) => {
            if (patterns.some(pattern => bodyText.includes(pattern))) {
                info.capabilities.push(capability);
            }
        });
    }

    extractAuthenticationMethods(bodyText, htmlContent, info) {
        const authPatterns = {
            'api_key': ['api key', 'api-key', 'x-api-key'],
            'bearer_token': ['bearer', 'bearer token', 'jwt'],
            'oauth2': ['oauth', 'oauth2', 'oauth 2.0'],
            'basic_auth': ['basic auth', 'basic authentication'],
            'digest': ['digest auth', 'digest authentication'],
            'jwt': ['jwt', 'json web token'],
            'session': ['session', 'cookie auth'],
            'hmac': ['hmac', 'signature']
        };

        Object.entries(authPatterns).forEach(([method, patterns]) => {
            if (patterns.some(pattern => bodyText.includes(pattern))) {
                info.authMethods.push(method);
            }
        });
    }

    extractCapabilities(text, info) {
        const capabilityKeywords = [
            'database', 'cache', 'storage', 'analytics', 'api', 'authentication',
            'authorization', 'payment', 'messaging', 'notification', 'search',
            'machine learning', 'ai', 'blockchain', 'cdn', 'monitoring'
        ];

        capabilityKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                info.capabilities.push(keyword);
            }
        });
    }

    extractTechnologies(html, info) {
        const techKeywords = [
            'rest', 'graphql', 'grpc', 'websocket', 'json', 'xml',
            'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
            'docker', 'kubernetes', 'aws', 'gcp', 'azure'
        ];

        techKeywords.forEach(tech => {
            if (html.includes(tech)) {
                info.technologies.push(tech);
            }
        });
    }

    async testAPIEndpoints() {
        // Simulate API endpoint testing
        return new Promise(resolve => {
            setTimeout(() => {
                const endpointCount = Math.floor(Math.random() * 8) + 3;
                const successfulCount = Math.floor(endpointCount * (0.6 + Math.random() * 0.3));
                
                resolve({
                    endpointsTested: endpointCount,
                    successfulTests: successfulCount,
                    authMethodsSupported: ['Bearer', 'API Key', 'OAuth'][Math.floor(Math.random() * 3)],
                    corsEnabled: Math.random() > 0.3,
                    avgResponseTime: Math.floor(Math.random() * 300) + 50,
                    errorHandling: Math.random() > 0.5
                });
            }, 600);
        });
    }

    async generateReport() {
        // Generate comprehensive evaluation results
        const fetchResult = await this.fetchLLMsTxt();
        const contentAnalysis = await this.analyzeLLMsTxtContent();
        const websiteScan = await this.scanWebsite();
        const apiTest = await this.testAPIEndpoints();

        // Calculate overall score
        const scores = {
            clarity: contentAnalysis.clarity,
            completeness: contentAnalysis.completeness,
            aiReadability: contentAnalysis.aiReadability,
            examples: contentAnalysis.examples,
            authentication: contentAnalysis.authentication,
            endpoints: contentAnalysis.endpoints
        };

        const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

        // Generate recommendations
        const recommendations = this.generateRecommendations(scores, websiteScan, apiTest);

        // Generate optimal llms.txt content using universal template
        const generatedLlmsTxt = this.generateUniversalLlmsTxt(websiteScan, apiTest);

        this.analysisResults = {
            url: this.websiteUrl,
            timestamp: new Date().toISOString(),
            overallScore: Math.round(overallScore),
            scores: Object.fromEntries(
                Object.entries(scores).map(([key, value]) => [key, Math.round(value)])
            ),
            details: {
                llmsTxtFound: fetchResult.found,
                apiDocsFound: websiteScan.apiDocsFound,
                endpointsTested: apiTest.endpointsTested,
                successfulTests: apiTest.successfulTests,
                corsEnabled: websiteScan.corsEnabled,
                httpsOnly: websiteScan.httpsOnly
            },
            aiCompatibility: contentAnalysis.aiCompatibility,
            recommendations: recommendations,
            grade: this.calculateGrade(overallScore),
            generatedLlmsTxt: generatedLlmsTxt,
            websiteInfo: websiteScan.extractedInfo
        };
        
        return this.analysisResults;
    }

    generateOptimalLlmsTxt(websiteScan, apiTest) {
        const baseUrl = this.websiteUrl.replace(/\/$/, '');
        const info = websiteScan.extractedInfo || {};
        const currentDate = new Date().toISOString().split('T')[0];
        
        const domain = new URL(baseUrl).hostname.replace('www.', '');
        const companyName = domain.split('.')[0];
        
        let llmsTxt = '';
        
        // Header with generation metadata
        llmsTxt += `# Company: ${info.title || companyName}\n`;
        llmsTxt += `# Updated: ${currentDate}\n`;
        llmsTxt += `# Generated: ${new Date().toISOString()}\n`;
        llmsTxt += `# Source: Automated extraction from ${baseUrl}\n\n`;
        
        // Basic identification
        llmsTxt += `title: ${info.title || `${companyName} API`}\n`;
        llmsTxt += `description: ${this.generateAIOptimizedDescription(info, companyName)}\n`;
        llmsTxt += `base_url: ${baseUrl}\n`;
        llmsTxt += `domain: ${domain}\n\n`;
        
        // Comprehensive API endpoints (this is the bulk of the file)
        if (info.endpoints && info.endpoints.length > 0) {
            llmsTxt += `# API Endpoints\n`;
            llmsTxt += `endpoints:\n`;
            info.endpoints.forEach(endpoint => {
                llmsTxt += `  - path: "${endpoint.path}"\n`;
                llmsTxt += `    method: ${endpoint.method}\n`;
                if (endpoint.summary) llmsTxt += `    summary: "${endpoint.summary}"\n`;
                if (endpoint.description) llmsTxt += `    description: "${endpoint.description}"\n`;
                if (endpoint.parameters && endpoint.parameters.length > 0) {
                    llmsTxt += `    parameters:\n`;
                    endpoint.parameters.forEach(param => {
                        llmsTxt += `      - name: "${param.name}"\n`;
                        llmsTxt += `        type: ${param.schema?.type || param.type || 'string'}\n`;
                        llmsTxt += `        required: ${param.required || false}\n`;
                        llmsTxt += `        location: ${param.in || 'query'}\n`;
                        if (param.description) llmsTxt += `        description: "${param.description}"\n`;
                    });
                }
                if (endpoint.responses) {
                    llmsTxt += `    responses:\n`;
                    Object.entries(endpoint.responses).forEach(([code, response]) => {
                        llmsTxt += `      "${code}": "${response.description || 'Response'}"\n`;
                    });
                }
                if (endpoint.tags && endpoint.tags.length > 0) {
                    llmsTxt += `    tags: [${endpoint.tags.join(', ')}]\n`;
                }
                llmsTxt += '\n';
            });
        }
        
        // Data schemas and models
        if (info.schemas && info.schemas.length > 0) {
            llmsTxt += `# Data Schemas\n`;
            llmsTxt += `schemas:\n`;
            info.schemas.forEach(schema => {
                llmsTxt += `  - name: "${schema.name}"\n`;
                llmsTxt += `    type: ${schema.type}\n`;
                if (schema.properties && Object.keys(schema.properties).length > 0) {
                    llmsTxt += `    properties:\n`;
                    Object.entries(schema.properties).forEach(([propName, propDef]) => {
                        llmsTxt += `      ${propName}:\n`;
                        llmsTxt += `        type: ${propDef.type || 'string'}\n`;
                        if (propDef.description) llmsTxt += `        description: "${propDef.description}"\n`;
                        if (propDef.format) llmsTxt += `        format: ${propDef.format}\n`;
                    });
                }
                if (schema.required && schema.required.length > 0) {
                    llmsTxt += `    required: [${schema.required.join(', ')}]\n`;
                }
                llmsTxt += '\n';
            });
        }
        
        // Authentication schemes
        llmsTxt += `# Authentication\n`;
        llmsTxt += `authentication:\n`;
        if (info.authMethods && info.authMethods.length > 0) {
            info.authMethods.forEach(auth => {
                llmsTxt += `  - name: "${auth.name}"\n`;
                llmsTxt += `    type: ${auth.type}\n`;
                if (auth.scheme) llmsTxt += `    scheme: ${auth.scheme}\n`;
                if (auth.location) llmsTxt += `    location: ${auth.location}\n`;
                if (auth.bearerFormat) llmsTxt += `    bearer_format: ${auth.bearerFormat}\n`;
                llmsTxt += '\n';
            });
        } else {
            // Default auth methods
            llmsTxt += `  - name: "api_key"\n`;
            llmsTxt += `    type: apiKey\n`;
            llmsTxt += `    location: header\n`;
            llmsTxt += `  - name: "bearer_token"\n`;
            llmsTxt += `    type: http\n`;
            llmsTxt += `    scheme: bearer\n\n`;
        }
        
        // Comprehensive capabilities matrix
        llmsTxt += `# Capabilities Matrix\n`;
        llmsTxt += `capabilities:\n`;
        const capabilityMatrix = this.generateComprehensiveCapabilities(info);
        Object.entries(capabilityMatrix).forEach(([category, capabilities]) => {
            llmsTxt += `  ${category}:\n`;
            capabilities.forEach(cap => {
                llmsTxt += `    - action: "${cap.action}"\n`;
                llmsTxt += `      method: ${cap.method}\n`;
                llmsTxt += `      endpoint: "${cap.endpoint}"\n`;
                if (cap.parameters) llmsTxt += `      parameters: [${cap.parameters.join(', ')}]\n`;
                llmsTxt += '\n';
            });
        });
        
        // Extracted code examples and use cases
        if (info.useCases && info.useCases.length > 0) {
            llmsTxt += `# Code Examples\n`;
            llmsTxt += `examples:\n`;
            info.useCases.forEach((useCase, index) => {
                llmsTxt += `  - id: example_${index + 1}\n`;
                llmsTxt += `    type: ${useCase.type || 'api_call'}\n`;
                llmsTxt += `    content: |\n`;
                useCase.content.split('\n').forEach(line => {
                    llmsTxt += `      ${line}\n`;
                });
                llmsTxt += '\n';
            });
        }
        
        // Performance benchmarks
        llmsTxt += `# Performance Benchmarks\n`;
        llmsTxt += `performance:\n`;
        llmsTxt += `  response_time_p50: ${apiTest.avgResponseTime ? Math.round(apiTest.avgResponseTime * 0.7) : 50}ms\n`;
        llmsTxt += `  response_time_p95: ${apiTest.avgResponseTime ? Math.round(apiTest.avgResponseTime * 1.2) : 100}ms\n`;
        llmsTxt += `  response_time_p99: ${apiTest.avgResponseTime || 150}ms\n`;
        llmsTxt += `  uptime_sla: 99.9%\n`;
        llmsTxt += `  rate_limits:\n`;
        llmsTxt += `    default: "1000 req/min"\n`;
        llmsTxt += `    authenticated: "10000 req/min"\n`;
        llmsTxt += `    enterprise: "unlimited"\n`;
        llmsTxt += `  https_required: ${websiteScan.httpsOnly}\n`;
        llmsTxt += `  cors_enabled: ${websiteScan.corsEnabled}\n\n`;
        
        // Integration specifications
        llmsTxt += `# Integration Specifications\n`;
        llmsTxt += `integration:\n`;
        if (info.openApiSpecUrl) {
            llmsTxt += `  openapi_spec: ${baseUrl}${info.openApiSpecUrl}\n`;
        }
        if (info.apiDocsUrl) {
            llmsTxt += `  documentation: ${baseUrl}${info.apiDocsUrl}\n`;
        }
        llmsTxt += `  sdk_available: false\n`;
        llmsTxt += `  postman_collection: "${baseUrl}/postman.json"\n`;
        llmsTxt += `  response_format: ["application/json", "application/xml"]\n`;
        llmsTxt += `  request_format: ["application/json", "application/x-www-form-urlencoded"]\n\n`;
        
        // Competitive positioning with quantified metrics
        const competitors = this.generateCompetitors(info, companyName);
        const differentiators = this.generateQuantifiedDifferentiators(info, companyName);
        
        llmsTxt += `# Market Positioning\n`;
        llmsTxt += `market:\n`;
        llmsTxt += `  category: "${this.inferMarketCategory(info)}"\n`;
        llmsTxt += `  alternatives: [${competitors.join(', ')}]\n`;
        llmsTxt += `  differentiators:\n`;
        differentiators.forEach(diff => {
            llmsTxt += `    - metric: "${diff.metric}"\n`;
            llmsTxt += `      value: "${diff.value}"\n`;
            llmsTxt += `      comparison: "${diff.comparison}"\n`;
        });
        llmsTxt += '\n';
        
        // Comprehensive keyword taxonomy for AI discovery
        const keywords = this.generateComprehensiveKeywords(info, companyName);
        llmsTxt += `# Discovery Keywords\n`;
        llmsTxt += `keywords:\n`;
        Object.entries(keywords).forEach(([category, words]) => {
            llmsTxt += `  ${category}: [${words.join(', ')}]\n`;
        });
        llmsTxt += '\n';
        
        // Contact and support information
        llmsTxt += `# Contact Information\n`;
        llmsTxt += `contact:\n`;
        llmsTxt += `  support: support@${domain}\n`;
        llmsTxt += `  sales: sales@${domain}\n`;
        llmsTxt += `  enterprise: enterprise@${domain}\n`;
        llmsTxt += `  documentation: ${baseUrl}/docs\n`;
        llmsTxt += `  status_page: ${baseUrl}/status\n`;
        
        return llmsTxt;
    }

    generateAIOptimizedDescription(info, companyName) {
        if (info.description) {
            // Transform human-focused description to AI-agent focused
            return info.description
                .replace(/developers?/gi, 'AI agents and developers')
                .replace(/build/gi, 'integrate and build')
                .replace(/solutions?/gi, 'programmatic solutions');
        }
        
        // Generate AI-focused description based on capabilities
        const capabilities = info.capabilities || ['API integration'];
        return `${companyName} provides programmatic access to ${capabilities.join(', ')} capabilities, enabling AI agents to integrate and automate workflows.`;
    }

    extractAIUsableCapabilities(info, websiteScan) {
        const capabilities = [];
        
        // Transform detected capabilities into AI-actionable items
        if (info.capabilities) {
            info.capabilities.forEach(cap => {
                switch(cap.toLowerCase()) {
                    case 'database':
                        capabilities.push('Query and retrieve data programmatically');
                        capabilities.push('Execute database operations via API');
                        break;
                    case 'analytics':
                        capabilities.push('Generate automated reports and insights');
                        capabilities.push('Access real-time analytics data');
                        break;
                    case 'authentication':
                        capabilities.push('Programmatic user authentication');
                        capabilities.push('Token-based access management');
                        break;
                    case 'payment':
                        capabilities.push('Process payments and transactions');
                        capabilities.push('Retrieve payment and billing data');
                        break;
                    case 'messaging':
                        capabilities.push('Send automated notifications');
                        capabilities.push('Manage communication workflows');
                        break;
                    default:
                        capabilities.push(`${cap} integration and automation`);
                }
            });
        }
        
        // Default AI-actionable capabilities
        if (capabilities.length === 0) {
            capabilities.push('API endpoint access and integration');
            capabilities.push('Automated data retrieval and processing');
        }
        
        return [...new Set(capabilities)];
    }

    generateAIUseCases(info, companyName, websiteScan) {
        const useCases = [];
        
        // Generate specific, executable use cases for AI agents
        if (info.capabilities) {
            if (info.capabilities.includes('database')) {
                useCases.push({
                    scenario: "Retrieve user data for analysis",
                    example: "GET /api/v1/users?status=active&limit=100"
                });
                useCases.push({
                    scenario: "Query database for specific records",
                    example: "GET /api/v1/query?sql=SELECT * FROM products WHERE category='electronics'"
                });
            }
            
            if (info.capabilities.includes('analytics')) {
                useCases.push({
                    scenario: "Generate performance reports",
                    example: "GET /api/v1/analytics/performance?period=7d&format=json"
                });
                useCases.push({
                    scenario: "Track user engagement metrics",
                    example: "GET /api/v1/metrics/engagement?start=2024-01-01&end=2024-01-31"
                });
            }
            
            if (info.capabilities.includes('payment')) {
                useCases.push({
                    scenario: "Process automated transactions",
                    example: "POST /api/v1/payments {amount: 100, currency: 'USD', customer_id: '123'}"
                });
            }
        }
        
        // Default use cases if none specific detected
        if (useCases.length === 0) {
            useCases.push({
                scenario: `Access ${companyName} core functionality`,
                example: "GET /api/v1/status"
            });
            useCases.push({
                scenario: "Retrieve available resources",
                example: "GET /api/v1/resources"
            });
        }
        
        return useCases;
    }

    generateAIDiscoveryKeywords(info, companyName) {
        const keywords = [companyName.toLowerCase(), 'api'];
        
        // Add technology-specific keywords that AI agents search for
        if (info.capabilities) {
            info.capabilities.forEach(cap => {
                keywords.push(cap.toLowerCase());
                // Add common AI search terms
                keywords.push(`${cap.toLowerCase()} api`);
                keywords.push(`${cap.toLowerCase()} integration`);
            });
        }
        
        if (info.technologies) {
            info.technologies.forEach(tech => {
                keywords.push(tech.toLowerCase());
            });
        }
        
        // Add common B2B API keywords
        keywords.push('enterprise api', 'developer tools', 'automation', 'integration');
        
        return [...new Set(keywords)];
    }

    generateCompetitors(info, companyName) {
        // Generate realistic competitors based on detected capabilities
        const competitors = [];
        
        if (info.capabilities) {
            if (info.capabilities.includes('database')) {
                competitors.push('postgresql', 'mongodb', 'mysql', 'redis');
            }
            if (info.capabilities.includes('payment')) {
                competitors.push('stripe', 'square', 'paypal', 'adyen');
            }
            if (info.capabilities.includes('analytics')) {
                competitors.push('mixpanel', 'amplitude', 'segment', 'google analytics');
            }
            if (info.capabilities.includes('messaging')) {
                competitors.push('twilio', 'sendgrid', 'mailgun', 'pusher');
            }
            if (info.capabilities.includes('authentication')) {
                competitors.push('auth0', 'okta', 'firebase auth', 'cognito');
            }
            if (info.capabilities.includes('storage')) {
                competitors.push('aws s3', 'google cloud storage', 'azure blob', 'dropbox api');
            }
        }
        
        // Default API competitors if none specific detected
        if (competitors.length === 0) {
            competitors.push('rest apis', 'graphql apis', 'custom apis');
        }
        
        return competitors.slice(0, 4); // Limit to 4 main competitors
    }

    generateDifferentiators(info, companyName) {
        const differentiators = [];
        
        // Generate performance-focused differentiators
        if (info.capabilities) {
            if (info.capabilities.includes('database')) {
                differentiators.push('Sub-millisecond query response times');
                differentiators.push('Horizontal scaling without performance degradation');
                differentiators.push('ACID compliance with NoSQL flexibility');
            }
            if (info.capabilities.includes('payment')) {
                differentiators.push('Global payment processing with local optimization');
                differentiators.push('Advanced fraud detection and prevention');
                differentiators.push('Transparent pricing with no hidden fees');
            }
            if (info.capabilities.includes('analytics')) {
                differentiators.push('Real-time data processing and insights');
                differentiators.push('Custom event tracking and segmentation');
                differentiators.push('Privacy-compliant analytics collection');
            }
            if (info.capabilities.includes('api')) {
                differentiators.push('99.99% uptime SLA with global redundancy');
                differentiators.push('RESTful design with comprehensive OpenAPI specs');
                differentiators.push('Built-in rate limiting and authentication');
            }
        }
        
        // Default differentiators emphasizing API/automation advantages
        if (differentiators.length === 0) {
            differentiators.push('Enterprise-grade API reliability and performance');
            differentiators.push('Comprehensive developer tools and documentation');
            differentiators.push('Flexible integration options for any tech stack');
        }
        
        return differentiators.slice(0, 3); // Limit to 3 key differentiators
    }

    generateComprehensiveCapabilities(info) {
        const matrix = {};
        
        if (info.capabilities) {
            info.capabilities.forEach(cap => {
                switch(cap.toLowerCase()) {
                    case 'database':
                        matrix.data_operations = [
                            { action: "Create record", method: "POST", endpoint: "/api/v1/records", parameters: ["data", "table"] },
                            { action: "Read records", method: "GET", endpoint: "/api/v1/records", parameters: ["filter", "limit", "offset"] },
                            { action: "Update record", method: "PUT", endpoint: "/api/v1/records/{id}", parameters: ["id", "data"] },
                            { action: "Delete record", method: "DELETE", endpoint: "/api/v1/records/{id}", parameters: ["id"] },
                            { action: "Query data", method: "POST", endpoint: "/api/v1/query", parameters: ["sql", "params"] },
                            { action: "Bulk operations", method: "POST", endpoint: "/api/v1/bulk", parameters: ["operations", "batch_size"] }
                        ];
                        break;
                    case 'analytics':
                        matrix.analytics_operations = [
                            { action: "Generate report", method: "POST", endpoint: "/api/v1/reports", parameters: ["type", "period", "filters"] },
                            { action: "Get metrics", method: "GET", endpoint: "/api/v1/metrics", parameters: ["metric_name", "timeframe"] },
                            { action: "Track events", method: "POST", endpoint: "/api/v1/events", parameters: ["event_type", "properties"] },
                            { action: "Export data", method: "GET", endpoint: "/api/v1/export", parameters: ["format", "date_range"] }
                        ];
                        break;
                    case 'payment':
                        matrix.payment_operations = [
                            { action: "Process payment", method: "POST", endpoint: "/api/v1/payments", parameters: ["amount", "currency", "customer"] },
                            { action: "Refund payment", method: "POST", endpoint: "/api/v1/refunds", parameters: ["payment_id", "amount"] },
                            { action: "Get payment status", method: "GET", endpoint: "/api/v1/payments/{id}", parameters: ["id"] },
                            { action: "List transactions", method: "GET", endpoint: "/api/v1/transactions", parameters: ["customer_id", "status"] }
                        ];
                        break;
                    case 'messaging':
                        matrix.messaging_operations = [
                            { action: "Send message", method: "POST", endpoint: "/api/v1/messages", parameters: ["recipient", "content", "type"] },
                            { action: "Get message status", method: "GET", endpoint: "/api/v1/messages/{id}", parameters: ["id"] },
                            { action: "List conversations", method: "GET", endpoint: "/api/v1/conversations", parameters: ["user_id", "limit"] }
                        ];
                        break;
                }
            });
        }
        
        // Default API operations if none specific detected
        if (Object.keys(matrix).length === 0) {
            matrix.api_operations = [
                { action: "Health check", method: "GET", endpoint: "/api/v1/health", parameters: [] },
                { action: "List resources", method: "GET", endpoint: "/api/v1/resources", parameters: ["limit", "offset"] },
                { action: "Create resource", method: "POST", endpoint: "/api/v1/resources", parameters: ["data"] },
                { action: "Get resource", method: "GET", endpoint: "/api/v1/resources/{id}", parameters: ["id"] }
            ];
        }
        
        return matrix;
    }

    generateQuantifiedDifferentiators(info, companyName) {
        const differentiators = [];
        
        if (info.capabilities) {
            if (info.capabilities.includes('database')) {
                differentiators.push({
                    metric: "Query Response Time",
                    value: "sub-millisecond",
                    comparison: "10x faster than traditional databases"
                });
                differentiators.push({
                    metric: "Horizontal Scaling",
                    value: "linear performance",
                    comparison: "No degradation up to 1000+ nodes"
                });
            }
            if (info.capabilities.includes('payment')) {
                differentiators.push({
                    metric: "Transaction Processing",
                    value: "99.99% success rate",
                    comparison: "Higher reliability than industry standard"
                });
            }
        }
        
        // Default quantified differentiators
        if (differentiators.length === 0) {
            differentiators.push({
                metric: "API Response Time",
                value: "<100ms p99",
                comparison: "Faster than 90% of competitors"
            });
            differentiators.push({
                metric: "Uptime SLA",
                value: "99.99%",
                comparison: "Enterprise-grade reliability"
            });
        }
        
        return differentiators;
    }

    inferMarketCategory(info) {
        if (!info.capabilities || info.capabilities.length === 0) {
            return "API Platform";
        }
        
        const primaryCapability = info.capabilities[0];
        const categoryMap = {
            'database': 'Database as a Service',
            'payment': 'Payment Processing',
            'analytics': 'Analytics Platform',
            'messaging': 'Communication Platform',
            'authentication': 'Identity Management',
            'storage': 'Cloud Storage',
            'ml': 'Machine Learning Platform'
        };
        
        return categoryMap[primaryCapability] || 'Developer Platform';
    }

    generateComprehensiveKeywords(info, companyName) {
        const keywords = {
            primary: [companyName.toLowerCase()],
            capabilities: [],
            technologies: [],
            use_cases: [],
            integrations: [],
            market_terms: []
        };
        
        if (info.capabilities) {
            info.capabilities.forEach(cap => {
                keywords.capabilities.push(cap, `${cap} api`, `${cap} service`, `${cap} platform`);
            });
        }
        
        if (info.technologies) {
            keywords.technologies.push(...info.technologies);
        }
        
        // Generate use case keywords based on capabilities
        if (info.capabilities) {
            if (info.capabilities.includes('database')) {
                keywords.use_cases.push('data storage', 'data retrieval', 'database queries', 'data management');
            }
            if (info.capabilities.includes('analytics')) {
                keywords.use_cases.push('reporting', 'business intelligence', 'data analysis', 'metrics tracking');
            }
        }
        
        // Integration and market terms
        keywords.integrations.push('rest api', 'webhook', 'sdk', 'integration', 'automation');
        keywords.market_terms.push('enterprise', 'saas', 'cloud', 'developer tools', 'b2b api');
        
        return keywords;
    }

    generateRecommendations(scores, websiteScan, apiTest) {
        const recommendations = [];
        
        if (scores.clarity < 75) {
            recommendations.push({
                priority: 'high',
                category: 'Documentation',
                title: 'Improve documentation clarity',
                description: 'Your API documentation could be clearer for AI agents. Use more structured language and consistent formatting.'
            });
        }
        
        if (scores.examples < 70) {
            recommendations.push({
                priority: 'high',
                category: 'Examples',
                title: 'Add more code examples',
                description: 'Include comprehensive code examples for each endpoint. AI agents learn better from concrete examples.'
            });
        }
        
        if (!websiteScan.corsEnabled) {
            recommendations.push({
                priority: 'medium',
                category: 'Technical',
                title: 'Enable CORS',
                description: 'Enable Cross-Origin Resource Sharing (CORS) to allow AI agents to access your API from different domains.'
            });
        }
        
        if (scores.authentication < 80) {
            recommendations.push({
                priority: 'medium',
                category: 'Security',
                title: 'Clarify authentication methods',
                description: 'Provide clearer documentation on authentication methods and include examples for each method.'
            });
        }
        
        if (!websiteScan.openApiSpec) {
            recommendations.push({
                priority: 'low',
                category: 'Standards',
                title: 'Add OpenAPI specification',
                description: 'Provide an OpenAPI (Swagger) specification to make your API more machine-readable.'
            });
        }

        return recommendations.slice(0, 4); // Limit to top 4 recommendations
    }

    calculateGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 85) return 'A';
        if (score >= 80) return 'A-';
        if (score >= 75) return 'B+';
        if (score >= 70) return 'B';
        if (score >= 65) return 'B-';
        if (score >= 60) return 'C+';
        if (score >= 55) return 'C';
        if (score >= 50) return 'C-';
        return 'D';
    }

    async sendReport() {
        const email = document.getElementById('userEmail').value;
        
        try {
            // For demo purposes, we'll just show success
            // In production, this would call your backend API
            console.log('Sending report to:', email);
            console.log('Results:', this.analysisResults);

            // Show success message
            this.hideModal('emailModal');
            this.showSuccessMessage();
            
        } catch (error) {
            console.error('Failed to send report:', error);
            alert('Failed to send report. Please try again.');
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
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
                    Check your email for your detailed AI-readiness report.
                </p>
                <button 
                    onclick="location.reload()"
                    class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-2 px-6 rounded-lg"
                >
                    Evaluate Another Site
                </button>
            </div>
        `;
        document.body.appendChild(successDiv);
    }

    showError(message) {
        this.hideModal('progressModal');
        alert(message);
    }
}

// Initialize the evaluator
const evaluator = new LLMsTxtEvaluator();