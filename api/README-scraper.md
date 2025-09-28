# llms.txt Generator - Real Web Scraping

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npx playwright install chromium
```

3. Start the scraper service:
```bash
npm run scraper
```

The scraper will run on port 3001.

## How It Works

The scraper uses Playwright to comprehensively crawl websites and extract:

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