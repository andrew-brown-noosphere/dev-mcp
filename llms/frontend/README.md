# LLMs.txt Generator

A comprehensive React-based tool for generating AI-optimized llms.txt files from any website. Transform your B2B vendor site from human-focused to AI-agent-ready.

## Features

- **Comprehensive Website Scanning**: Automatically discovers APIs, documentation, and GitHub repositories
- **AI-Optimized Generation**: Creates massive, machine-readable files that AI agents can parse instantly
- **OpenAPI Integration**: Extracts endpoints, parameters, schemas, and authentication methods
- **GitHub Analysis**: Pulls code examples from repositories
- **Performance Metrics**: Includes benchmarks and competitive positioning
- **Keyword Optimization**: Comprehensive taxonomy for AI agent discovery

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API routes, Node.js
- **Scanning**: Cheerio for HTML parsing, OpenAPI/Swagger parsing
- **Styling**: Tailwind CSS with custom design system

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Endpoints

### POST /api/generate

Generate a comprehensive llms.txt file for a website.

**Request Body:**
```json
{
  "websiteUrl": "https://example.com",
  "openApiUrl": "https://api.example.com/swagger.json", // optional
  "githubRepo": "https://github.com/owner/repo", // optional
  "docsUrl": "https://docs.example.com/api" // optional
}
```

**Response:**
```json
{
  "llmsTxt": "# Generated llms.txt content...",
  "metadata": {
    "scannedUrl": "https://example.com",
    "timestamp": "2025-09-27T...",
    "endpointsFound": 12,
    "schemasExtracted": 5,
    "githubRepo": "https://github.com/owner/repo",
    "openApiSpec": "https://api.example.com/swagger.json"
  }
}
```

## Architecture

```
/app
  /api/generate/route.ts    # Main generation API endpoint
  /page.tsx                 # Main React page
  /layout.tsx              # App layout
  /globals.css             # Global styles

/components
  /Header.tsx              # Navigation header
  /GeneratorForm.tsx       # Website input form
  /LoadingState.tsx        # Generation progress display
  /OutputDisplay.tsx       # Generated file display
  /FeatureGrid.tsx         # Feature showcase

/lib
  /websiteScanner.ts       # Website analysis and data extraction
  /llmsTxtGenerator.ts     # LLMs.txt file generation
```

## Generated File Structure

The generated llms.txt files include:

- **API Endpoints Matrix**: Complete endpoint documentation with parameters and responses
- **Data Schemas**: Extracted from OpenAPI specifications
- **Authentication**: Detailed authentication method documentation
- **Capabilities Matrix**: Business functions mapped to API endpoints
- **Performance Benchmarks**: Quantified metrics and competitive positioning
- **Discovery Keywords**: Comprehensive taxonomy for AI agent discovery
- **Code Examples**: Extracted from GitHub repositories and documentation
- **Contact Information**: Support and integration details

## License

MIT License - see LICENSE file for details.