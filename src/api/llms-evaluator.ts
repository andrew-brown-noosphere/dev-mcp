// Backend API for llms.txt evaluator
import { NextApiRequest, NextApiResponse } from 'next';

interface EvaluatorRequest {
  url: string;
  domain: string;
}

interface LLMsTxtAnalysis {
  url: string;
  domain: string;
  timestamp: string;
  overallScore: number;
  llmsTxtFound: boolean;
  llmsTxtLocation?: string;
  llmsTxtContent?: string;
  scores: {
    clarity: number;
    completeness: number;
    aiReadability: number;
    examples: number;
    authentication: number;
    endpoints: number;
  };
  details: {
    sections: {
      authentication: boolean;
      endpoints: boolean;
      examples: boolean;
      rate_limits: boolean;
      error_handling: boolean;
    };
    aiCompatibility: {
      claude: number;
      gpt4: number;
      general: number;
    };
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
  }>;
  grade: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, domain } = req.body as EvaluatorRequest;

    // Normalize domain
    let normalizedDomain = domain;
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
      normalizedDomain = 'https://' + domain;
    }

    const urlObj = new URL(normalizedDomain);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

    // Step 1: Try to fetch llms.txt
    const llmsTxtResult = await fetchLLMsTxt(baseUrl);

    // Step 2: Analyze content
    const analysis = await analyzeLLMsTxt(llmsTxtResult, baseUrl);

    res.status(200).json(analysis);
  } catch (error) {
    console.error('Evaluator error:', error);
    res.status(500).json({ error: 'Failed to analyze URL' });
  }
}

async function fetchLLMsTxt(baseUrl: string) {
  const locations = [
    `${baseUrl}/llms.txt`,
    `${baseUrl}/.well-known/llms.txt`
  ];

  for (const location of locations) {
    try {
      const response = await fetch(location, {
        headers: {
          'User-Agent': 'DevMCP.ai LLMs.txt Evaluator/1.0'
        }
      });

      if (response.ok) {
        const content = await response.text();
        if (content && content.trim() && !content.includes('<!DOCTYPE')) {
          return {
            found: true,
            location,
            content
          };
        }
      }
    } catch (error) {
      // Continue to next location
      console.log(`Failed to fetch ${location}:`, error);
    }
  }

  return {
    found: false,
    location: null,
    content: null
  };
}

async function analyzeLLMsTxt(
  llmsTxtResult: { found: boolean; location: string | null; content: string | null },
  baseUrl: string
): Promise<LLMsTxtAnalysis> {
  if (!llmsTxtResult.found || !llmsTxtResult.content) {
    // Return analysis for missing llms.txt
    return {
      url: baseUrl,
      domain: new URL(baseUrl).hostname,
      timestamp: new Date().toISOString(),
      overallScore: 0,
      llmsTxtFound: false,
      scores: {
        clarity: 0,
        completeness: 0,
        aiReadability: 0,
        examples: 0,
        authentication: 0,
        endpoints: 0
      },
      details: {
        sections: {
          authentication: false,
          endpoints: false,
          examples: false,
          rate_limits: false,
          error_handling: false
        },
        aiCompatibility: {
          claude: 0,
          gpt4: 0,
          general: 0
        }
      },
      recommendations: [
        {
          priority: 'high',
          category: 'Documentation',
          title: 'Create llms.txt file',
          description: 'Add an llms.txt file to make your API discoverable by AI agents. Place it at /llms.txt or /.well-known/llms.txt'
        },
        {
          priority: 'high',
          category: 'AI Integration',
          title: 'Define API instructions for AI',
          description: 'Include clear instructions on how AI agents should use your API, including authentication, endpoints, and examples'
        }
      ],
      grade: 'F'
    };
  }

  // Analyze the content
  const content = llmsTxtResult.content.toLowerCase();
  const lines = llmsTxtResult.content.split('\n');

  // Check for key sections
  const sections = {
    authentication: content.includes('auth') || content.includes('token') || content.includes('key'),
    endpoints: content.includes('endpoint') || content.includes('api') || content.includes('get ') || content.includes('post '),
    examples: content.includes('example') || content.includes('curl') || content.includes('```'),
    rate_limits: content.includes('rate') || content.includes('limit') || content.includes('throttle'),
    error_handling: content.includes('error') || content.includes('status') || content.includes('code')
  };

  // Calculate scores
  const scores = {
    clarity: scoreClarity(lines, content),
    completeness: scoreCompleteness(sections),
    aiReadability: scoreAIReadability(content, lines),
    examples: scoreExamples(content),
    authentication: scoreAuthentication(content),
    endpoints: scoreEndpoints(content, lines)
  };

  // Calculate overall score
  const overallScore = Math.round(
    Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length
  );

  // AI compatibility based on structure and clarity
  const aiCompatibility = {
    claude: Math.max(0.1, Math.min(1.0, overallScore / 100 + 0.1)),
    gpt4: Math.max(0.1, Math.min(1.0, overallScore / 100 + 0.05)),
    general: Math.max(0.1, Math.min(1.0, overallScore / 100))
  };

  // Generate recommendations
  const recommendations = generateRecommendations(scores, sections);

  return {
    url: baseUrl,
    domain: new URL(baseUrl).hostname,
    timestamp: new Date().toISOString(),
    overallScore,
    llmsTxtFound: true,
    llmsTxtLocation: llmsTxtResult.location!,
    llmsTxtContent: llmsTxtResult.content,
    scores,
    details: {
      sections,
      aiCompatibility
    },
    recommendations,
    grade: calculateGrade(overallScore)
  };
}

function scoreClarity(lines: string[], content: string): number {
  let score = 30;
  
  if (lines.some(line => line.startsWith('#'))) score += 20;
  if (lines.length > 5) score += 15;
  if (lines.filter(line => line.trim()).length > lines.length * 0.7) score += 15;
  
  return Math.min(100, score + Math.random() * 20);
}

function scoreCompleteness(sections: any): number {
  let score = 20;
  
  if (sections.authentication) score += 25;
  if (sections.endpoints) score += 25;
  if (sections.examples) score += 15;
  if (sections.rate_limits) score += 10;
  if (sections.error_handling) score += 5;
  
  return Math.min(100, score);
}

function scoreAIReadability(content: string, lines: string[]): number {
  let score = 25;
  
  if (content.includes('instruction') || content.includes('how to')) score += 20;
  if (lines.some(line => line.includes('##') || line.includes('###'))) score += 15;
  if (content.includes('```') || content.includes('`')) score += 15;
  if (content.includes('- ') || content.includes('* ')) score += 10;
  
  return Math.min(100, score + Math.random() * 15);
}

function scoreExamples(content: string): number {
  let score = 10;
  
  if (content.includes('curl')) score += 30;
  if (content.includes('```')) score += 25;
  if (content.includes('example')) score += 20;
  if (content.includes('http')) score += 15;
  
  return Math.min(100, score);
}

function scoreAuthentication(content: string): number {
  let score = 20;
  
  if (content.includes('bearer')) score += 25;
  if (content.includes('api key') || content.includes('api-key')) score += 25;
  if (content.includes('oauth')) score += 20;
  if (content.includes('token')) score += 15;
  if (content.includes('authorization')) score += 10;
  
  return Math.min(100, score);
}

function scoreEndpoints(content: string, lines: string[]): number {
  let score = 15;
  
  const methods = ['get', 'post', 'put', 'delete', 'patch'];
  methods.forEach(method => {
    if (content.includes(method + ' ') || content.includes(method + '\t')) score += 15;
  });
  
  if (content.includes('/api/')) score += 20;
  if (content.includes('https://') || content.includes('http://')) score += 10;
  
  return Math.min(100, score);
}

function generateRecommendations(scores: any, sections: any): any[] {
  const recommendations = [];
  
  if (scores.clarity < 75) {
    recommendations.push({
      priority: 'high',
      category: 'Documentation',
      title: 'Improve documentation clarity',
      description: 'Use structured headings, consistent formatting, and clear language to help AI agents understand your API better'
    });
  }
  
  if (scores.examples < 70) {
    recommendations.push({
      priority: 'high',
      category: 'Examples',
      title: 'Add more code examples',
      description: 'Include comprehensive curl examples and code snippets for each endpoint to help AI agents learn usage patterns'
    });
  }
  
  if (!sections.rate_limits) {
    recommendations.push({
      priority: 'medium',
      category: 'Technical',
      title: 'Document rate limits',
      description: 'Clearly specify rate limits and throttling policies so AI agents can respect your API limits'
    });
  }
  
  if (scores.authentication < 80) {
    recommendations.push({
      priority: 'medium',
      category: 'Security',
      title: 'Clarify authentication',
      description: 'Provide clear examples of how to authenticate, including header formats and token placement'
    });
  }
  
  return recommendations.slice(0, 4);
}

function calculateGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 75) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 65) return 'B-';
  if (score >= 60) return 'C+';
  if (score >= 55) return 'C';
  if (score >= 50) return 'C-';
  if (score >= 40) return 'D';
  return 'F';
}