# llms.txt Generator - AI-Powered Web Scraping

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

3. Set up environment variables:
```bash
cp .env.ai-example .env
# Edit .env and add your Anthropic API key
```

4. Start the scraper service:
```bash
npm run scraper
```

The scraper will run on port 3001.

## How It Works

The system combines web scraping with AI to generate intelligent llms.txt files:

### 1. Web Scraping (Playwright)
The scraper comprehensively crawls websites and extracts:

### Marketing Content
- Homepage title and description
- Value propositions
- Use cases from content
- Customer testimonials
- Case studies
- Blog insights

### Technical Information  
- API documentation URLs
- Code examples
- Authentication methods
- SDK availability
- API endpoints
- Performance metrics

### Deep Content Discovery
- Follows links to /blog, /docs, /customers, /case-studies
- Extracts workshop and training information
- Finds technical benchmarks
- Discovers developer resources

### 2. AI Generation (Claude)
After scraping, the system uses Claude AI to:
- Analyze all extracted content
- Understand the company's value proposition
- Generate a comprehensive llms.txt file
- Structure content for optimal AI agent discovery
- Include relevant examples and use cases

The AI considers:
- Marketing messaging and positioning
- Technical capabilities and APIs
- Customer success stories
- Performance metrics
- Developer resources

## Testing

Test the scraper directly:
```bash
curl -X POST http://localhost:3001/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url":"https://scylladb.com"}'
```

## Production Deployment

For production, consider:
1. Rate limiting to avoid overwhelming target sites
2. Caching scraped content
3. Running as a background service
4. Using a proxy pool for large-scale scraping
5. Adding user-agent rotation

## Fallback Mode

If the scraper service isn't running, the generator will fall back to pattern-based generation using pre-programmed content for known companies.