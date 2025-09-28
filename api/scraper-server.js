// Express server for the Playwright scraper
const express = require('express');
const cors = require('cors');
const { ComprehensiveScraper } = require('./scraper-playwright');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Scraper service is running' });
});

// Main scraping endpoint
app.post('/api/scrape', async (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ 
            success: false, 
            error: 'URL is required' 
        });
    }

    console.log(`Scraping request for: ${url}`);
    const scraper = new ComprehensiveScraper();
    
    try {
        const result = await scraper.scrapeWebsite(url);
        res.json(result);
    } catch (error) {
        console.error('Scraping error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Scraper service running on port ${PORT}`);
    console.log(`Test with: curl -X POST http://localhost:${PORT}/api/scrape -H "Content-Type: application/json" -d '{"url":"https://scylladb.com"}'`);
});