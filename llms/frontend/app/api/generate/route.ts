import { NextRequest, NextResponse } from 'next/server'
import { WebsiteScanner } from '@/lib/websiteScanner'
import { LlmsTxtGenerator } from '@/lib/llmsTxtGenerator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { websiteUrl, openApiUrl, githubRepo, docsUrl } = body

    if (!websiteUrl) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      )
    }

    // Initialize scanner with additional resources
    const scanner = new WebsiteScanner({
      openApiUrl,
      githubRepo,
      docsUrl
    })

    // Scan the website
    console.log(`Starting scan for: ${websiteUrl}`)
    const scanResults = await scanner.scanWebsite(websiteUrl)

    // Generate the llms.txt file
    const generator = new LlmsTxtGenerator()
    const llmsTxt = generator.generateComprehensiveLlmsTxt(scanResults)

    // Return the results
    const response = {
      llmsTxt,
      metadata: {
        scannedUrl: websiteUrl,
        timestamp: new Date().toISOString(),
        endpointsFound: scanResults.endpoints?.length || 0,
        schemasExtracted: scanResults.schemas?.length || 0,
        githubRepo: scanResults.githubInfo?.url,
        openApiSpec: scanResults.openApiSpecUrl
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Generation error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Generation failed',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'llms.txt Generator API',
    version: '1.0.0',
    endpoints: {
      generate: 'POST /api/generate'
    }
  })
}