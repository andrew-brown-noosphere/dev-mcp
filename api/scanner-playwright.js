// Real Web Scanning with Playwright for llms.txt Generator
const { chromium } = require('playwright');

class ComprehensiveScanner {
    constructor() {
        this.browser = null;
        this.context = null;
    }

    async initialize() {
        this.browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.context = await this.browser.newContext({
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        });
    }

    async scanWebsite(url) {
        try {
            await this.initialize();
            
            // Normalize URL
            if (!url.startsWith('http')) {
                url = 'https://' + url;
            }

            const domain = new URL(url).hostname;
            console.log(`Starting comprehensive scan of ${domain}...`);

            // Create page
            const page = await this.context.newPage();
            
            // Set timeout
            page.setDefaultTimeout(30000);

            // Step 1: Homepage analysis
            console.log('Analyzing homepage...');
            const homepageData = await this.scanHomepage(page, url);

            // Step 2: Find and scrape documentation
            console.log('Finding documentation...');
            const docsData = await this.scanDocumentation(page, url, homepageData.links);

            // Step 3: Scrape blog for insights
            console.log('Extracting blog insights...');
            const blogData = await this.scanBlog(page, url, homepageData.links);

            // Step 4: Find testimonials/case studies
            console.log('Looking for testimonials...');
            const testimonialsData = await this.scanTestimonials(page, url, homepageData.links);

            // Step 5: Extract technical information
            console.log('Extracting technical details...');
            const technicalData = await this.scanTechnicalDetails(page, url, homepageData.links);

            // Step 6: Find workshops/training
            console.log('Finding workshops and resources...');
            const workshopsData = await this.scanWorkshops(page, url, homepageData.links);

            // Combine all data
            return {
                success: true,
                domain: domain,
                data: {
                    marketing: {
                        found: true,
                        title: homepageData.title,
                        description: homepageData.description,
                        value_propositions: homepageData.valueProps,
                        useCases: [...homepageData.useCases, ...blogData.useCases],
                        differentiators: homepageData.differentiators,
                        blog_insights: blogData.insights,
                        testimonials: testimonialsData.testimonials,
                        workshops: workshopsData.workshops,
                        case_studies: testimonialsData.caseStudies
                    },
                    technical: {
                        found: docsData.found || technicalData.found,
                        documentation: docsData.docsUrl,
                        api_endpoints: technicalData.endpoints,
                        authentication: technicalData.authMethods,
                        sdks: technicalData.sdks,
                        code_examples: docsData.examples,
                        getting_started: docsData.gettingStarted
                    },
                    performance: {
                        metrics: technicalData.performanceMetrics,
                        benchmarks: technicalData.benchmarks
                    }
                }
            };

        } catch (error) {
            console.error('Scanning error:', error);
            return {
                success: false,
                error: error.message
            };
        } finally {
            await this.cleanup();
        }
    }

    async scanHomepage(page, url) {
        await page.goto(url, { waitUntil: 'networkidle' });
        
        // Extract title and meta description
        const title = await page.title();
        const description = await page.$eval('meta[name="description"]', el => el.content).catch(() => '');
        
        // Extract all links for further crawling
        const links = await page.evaluate(() => {
            const anchors = document.querySelectorAll('a[href]');
            const urls = new Set();
            anchors.forEach(a => {
                const href = a.href;
                if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
                    urls.add(href);
                }
            });
            return Array.from(urls);
        });

        // Extract value propositions (h1, h2 tags)
        const valueProps = await page.evaluate(() => {
            const headers = [...document.querySelectorAll('h1, h2')];
            return headers
                .map(h => h.textContent.trim())
                .filter(text => text.length > 10 && text.length < 100)
                .slice(0, 5);
        });

        // Extract use cases from content
        const useCases = await page.evaluate(() => {
            const content = document.body.textContent;
            const patterns = [
                /use cases?:?\s*([^.]+)/gi,
                /perfect for:?\s*([^.]+)/gi,
                /built for:?\s*([^.]+)/gi,
                /helps you:?\s*([^.]+)/gi
            ];
            
            const cases = new Set();
            patterns.forEach(pattern => {
                const matches = content.matchAll(pattern);
                for (const match of matches) {
                    if (match[1] && match[1].length < 200) {
                        cases.add(match[1].trim());
                    }
                }
            });
            return Array.from(cases);
        });

        // Extract differentiators (performance claims, unique features)
        const differentiators = await page.evaluate(() => {
            const content = document.body.textContent;
            const patterns = [
                /(\d+x\s*(faster|better|more efficient))/gi,
                /(99\.\d+%\s*(uptime|availability))/gi,
                /(<\s*\d+ms\s*(latency|response time))/gi,
                /(\d+[KMB]?\s*(ops\/s|requests\/s|queries\/s))/gi
            ];
            
            const diffs = new Set();
            patterns.forEach(pattern => {
                const matches = content.matchAll(pattern);
                for (const match of matches) {
                    if (match[0]) {
                        diffs.add(match[0].trim());
                    }
                }
            });
            return Array.from(diffs);
        });

        return {
            title,
            description,
            links,
            valueProps,
            useCases,
            differentiators
        };
    }

    async scanDocumentation(page, baseUrl, links) {
        // Find documentation URLs
        const docLinks = links.filter(link => 
            link.includes('/docs') || 
            link.includes('/documentation') || 
            link.includes('/api') ||
            link.includes('/developers')
        ).slice(0, 5); // Limit to 5 pages

        let docsData = {
            found: false,
            docsUrl: null,
            examples: [],
            gettingStarted: null
        };

        for (const docLink of docLinks) {
            try {
                await page.goto(docLink, { waitUntil: 'networkidle' });
                
                // Extract code examples
                const examples = await page.evaluate(() => {
                    const codeBlocks = [...document.querySelectorAll('pre code, .highlight, .code-block')];
                    return codeBlocks
                        .map(block => block.textContent)
                        .filter(code => code && code.length > 50)
                        .slice(0, 5);
                });

                // Extract getting started guide
                const gettingStarted = await page.evaluate(() => {
                    const getStarted = document.querySelector('[class*="getting-started"], [id*="getting-started"], h1:has-text("Getting Started"), h2:has-text("Quick Start")');
                    if (getStarted) {
                        const parent = getStarted.parentElement || getStarted;
                        return parent.textContent.substring(0, 1000);
                    }
                    return null;
                });

                if (examples.length > 0 || gettingStarted) {
                    docsData = {
                        found: true,
                        docsUrl: docLink,
                        examples,
                        gettingStarted
                    };
                    break;
                }
            } catch (error) {
                console.log(`Failed to scrape doc page ${docLink}:`, error.message);
            }
        }

        return docsData;
    }

    async scanBlog(page, baseUrl, links) {
        const blogLinks = links.filter(link => 
            link.includes('/blog') || 
            link.includes('/posts') || 
            link.includes('/articles') ||
            link.includes('/news')
        ).slice(0, 10); // Check up to 10 blog posts

        const insights = [];
        const useCases = new Set();

        for (const blogLink of blogLinks) {
            try {
                await page.goto(blogLink, { waitUntil: 'networkidle' });
                
                // Extract blog post titles and summaries
                const posts = await page.evaluate(() => {
                    const articles = [...document.querySelectorAll('article, .post, .blog-post, [class*="post-item"]')];
                    return articles.slice(0, 5).map(article => {
                        const title = article.querySelector('h1, h2, h3, .title')?.textContent?.trim();
                        const summary = article.querySelector('p, .summary, .excerpt')?.textContent?.trim();
                        return { title, summary };
                    }).filter(post => post.title);
                });

                posts.forEach(post => {
                    if (post.title) {
                        insights.push(post.title);
                        
                        // Extract use cases from blog content
                        if (post.summary) {
                            const useCaseMatches = post.summary.match(/(use.*?for|built for|perfect for|helps with)\s+([^,.]+)/gi);
                            if (useCaseMatches) {
                                useCaseMatches.forEach(match => useCases.add(match));
                            }
                        }
                    }
                });

                // Look for technical blog posts
                const technicalPosts = await page.evaluate(() => {
                    const content = document.body.textContent;
                    const technicalKeywords = ['performance', 'benchmark', 'architecture', 'migration', 'tutorial', 'how to'];
                    const titles = [...document.querySelectorAll('h1, h2, h3, a')];
                    
                    return titles
                        .map(el => el.textContent.trim())
                        .filter(title => {
                            const lower = title.toLowerCase();
                            return technicalKeywords.some(keyword => lower.includes(keyword));
                        })
                        .slice(0, 5);
                });

                insights.push(...technicalPosts);

            } catch (error) {
                console.log(`Failed to scrape blog ${blogLink}:`, error.message);
            }
        }

        return {
            insights: [...new Set(insights)].slice(0, 10),
            useCases: Array.from(useCases).slice(0, 5)
        };
    }

    async scanTestimonials(page, baseUrl, links) {
        const testimonialLinks = links.filter(link => 
            link.includes('/customers') || 
            link.includes('/testimonials') || 
            link.includes('/case-studies') ||
            link.includes('/success-stories')
        ).slice(0, 5);

        const testimonials = [];
        const caseStudies = [];

        // Also check homepage for testimonials
        testimonialLinks.unshift(baseUrl);

        for (const link of testimonialLinks) {
            try {
                await page.goto(link, { waitUntil: 'networkidle' });
                
                // Extract testimonials
                const pageTestimonials = await page.evaluate(() => {
                    const testimonialElements = [...document.querySelectorAll('[class*="testimonial"], [class*="quote"], blockquote, .customer-quote')];
                    
                    return testimonialElements.map(el => {
                        const quote = el.querySelector('p, .text, .quote-text')?.textContent?.trim() || el.textContent?.trim();
                        const company = el.querySelector('.company, .customer-name, .author')?.textContent?.trim();
                        const metric = el.querySelector('.metric, .stat, .number')?.textContent?.trim();
                        
                        return { quote, company, metric };
                    }).filter(t => t.quote && t.quote.length > 20);
                });

                testimonials.push(...pageTestimonials);

                // Extract case study titles
                const caseTitles = await page.evaluate(() => {
                    const titles = [...document.querySelectorAll('a, h2, h3')];
                    return titles
                        .map(el => el.textContent.trim())
                        .filter(text => {
                            const lower = text.toLowerCase();
                            return (lower.includes('case study') || lower.includes('customer story') || 
                                   lower.includes('success story')) && text.length < 100;
                        });
                });

                caseStudies.push(...caseTitles);

            } catch (error) {
                console.log(`Failed to scrape testimonials ${link}:`, error.message);
            }
        }

        return {
            testimonials: testimonials.slice(0, 5),
            caseStudies: [...new Set(caseStudies)].slice(0, 5)
        };
    }

    async scanTechnicalDetails(page, baseUrl, links) {
        const techLinks = links.filter(link => 
            link.includes('/api') || 
            link.includes('/developers') || 
            link.includes('/technical') ||
            link.includes('/performance') ||
            link.includes('/benchmarks')
        ).slice(0, 5);

        let technicalData = {
            found: false,
            endpoints: [],
            authMethods: [],
            sdks: [],
            performanceMetrics: [],
            benchmarks: []
        };

        for (const link of techLinks) {
            try {
                await page.goto(link, { waitUntil: 'networkidle' });
                
                // Extract API endpoints
                const endpoints = await page.evaluate(() => {
                    const content = document.body.textContent;
                    const endpointPattern = /(?:GET|POST|PUT|DELETE|PATCH)\s+\/[a-zA-Z0-9\/_\-{}]+/g;
                    const matches = content.match(endpointPattern) || [];
                    return [...new Set(matches)].slice(0, 10);
                });

                // Extract authentication methods
                const authMethods = await page.evaluate(() => {
                    const content = document.body.textContent.toLowerCase();
                    const methods = [];
                    
                    if (content.includes('api key')) methods.push('API Key');
                    if (content.includes('bearer token')) methods.push('Bearer Token');
                    if (content.includes('oauth')) methods.push('OAuth 2.0');
                    if (content.includes('basic auth')) methods.push('Basic Auth');
                    if (content.includes('jwt')) methods.push('JWT');
                    
                    return methods;
                });

                // Extract SDK languages
                const sdks = await page.evaluate(() => {
                    const content = document.body.textContent.toLowerCase();
                    const languages = [];
                    
                    const sdkPatterns = [
                        { pattern: 'python', name: 'Python' },
                        { pattern: 'javascript', name: 'JavaScript' },
                        { pattern: 'node.js', name: 'Node.js' },
                        { pattern: 'java', name: 'Java' },
                        { pattern: 'go', name: 'Go' },
                        { pattern: 'ruby', name: 'Ruby' },
                        { pattern: '.net', name: '.NET' },
                        { pattern: 'php', name: 'PHP' }
                    ];
                    
                    sdkPatterns.forEach(sdk => {
                        if (content.includes(sdk.pattern + ' sdk') || content.includes(sdk.pattern + ' client')) {
                            languages.push(sdk.name);
                        }
                    });
                    
                    return languages;
                });

                // Extract performance metrics
                const metrics = await page.evaluate(() => {
                    const content = document.body.textContent;
                    const metricPatterns = [
                        /(\d+(?:\.\d+)?)\s*ms\s*(?:latency|p99|p95|response time)/gi,
                        /(\d+[KMB]?)\s*(?:ops\/s|requests\/s|queries\/s|TPS)/gi,
                        /(99\.?\d*%)\s*(?:uptime|availability|SLA)/gi,
                        /(\d+(?:\.\d+)?[KMGT]B\/s)\s*(?:throughput|bandwidth)/gi
                    ];
                    
                    const found = [];
                    metricPatterns.forEach(pattern => {
                        const matches = content.matchAll(pattern);
                        for (const match of matches) {
                            found.push(match[0]);
                        }
                    });
                    
                    return found;
                });

                if (endpoints.length > 0 || authMethods.length > 0) {
                    technicalData = {
                        found: true,
                        endpoints: [...technicalData.endpoints, ...endpoints],
                        authMethods: [...new Set([...technicalData.authMethods, ...authMethods])],
                        sdks: [...new Set([...technicalData.sdks, ...sdks])],
                        performanceMetrics: [...technicalData.performanceMetrics, ...metrics],
                        benchmarks: technicalData.benchmarks
                    };
                }

            } catch (error) {
                console.log(`Failed to scrape technical page ${link}:`, error.message);
            }
        }

        return technicalData;
    }

    async scanWorkshops(page, baseUrl, links) {
        const workshopLinks = links.filter(link => 
            link.includes('/training') || 
            link.includes('/workshop') || 
            link.includes('/learn') ||
            link.includes('/academy') ||
            link.includes('/resources')
        ).slice(0, 5);

        const workshops = new Set();

        for (const link of workshopLinks) {
            try {
                await page.goto(link, { waitUntil: 'networkidle' });
                
                // Extract workshop/training titles
                const workshopTitles = await page.evaluate(() => {
                    const elements = [...document.querySelectorAll('h2, h3, .title, .workshop-title, .course-title')];
                    return elements
                        .map(el => el.textContent.trim())
                        .filter(text => {
                            const lower = text.toLowerCase();
                            return (lower.includes('workshop') || lower.includes('training') || 
                                   lower.includes('course') || lower.includes('tutorial') ||
                                   lower.includes('masterclass') || lower.includes('bootcamp')) &&
                                   text.length < 100;
                        });
                });

                workshopTitles.forEach(title => workshops.add(title));

                // Also look for learning resources
                const resources = await page.evaluate(() => {
                    const links = [...document.querySelectorAll('a')];
                    return links
                        .map(a => a.textContent.trim())
                        .filter(text => {
                            const lower = text.toLowerCase();
                            return (lower.includes('guide') || lower.includes('whitepaper') || 
                                   lower.includes('ebook') || lower.includes('webinar')) &&
                                   text.length > 10 && text.length < 100;
                        });
                });

                resources.forEach(resource => workshops.add(resource));

            } catch (error) {
                console.log(`Failed to scrape workshops ${link}:`, error.message);
            }
        }

        return {
            workshops: Array.from(workshops).slice(0, 10)
        };
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Export the scraper
module.exports = { ComprehensiveScanner };

// API endpoint handler
async function handleScrapeRequest(req, res) {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const scraper = new ComprehensiveScraper();
    
    try {
        const result = await scraper.scrapeWebsite(url);
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

// For serverless environments - removed for now since it's not needed