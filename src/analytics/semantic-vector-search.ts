import { EventEmitter } from 'events';

export interface APIPattern {
  id: string;
  pattern: string;
  category: 'authentication' | 'data_access' | 'mutation' | 'streaming' | 'batch' | 'webhook';
  description: string;
  examples: string[];
  weight: number;
  vector?: number[];
}

export interface PatternMatch {
  pattern: APIPattern;
  similarity: number;
  confidence: number;
  context: {
    endpoint: string;
    method: string;
    parameters?: Record<string, any>;
  };
}

export interface SemanticSearchEvent {
  query: string;
  matches: PatternMatch[];
  queryVector?: number[];
  timestamp: string;
  sessionId: string;
}

export class SemanticVectorSearch extends EventEmitter {
  private patterns: Map<string, APIPattern> = new Map();
  private vectorDimensions: number = 384; // Common embedding dimension
  private similarityThreshold: number = 0.7;

  constructor(config?: {
    vectorDimensions?: number;
    similarityThreshold?: number;
  }) {
    super();
    this.vectorDimensions = config?.vectorDimensions || 384;
    this.similarityThreshold = config?.similarityThreshold || 0.7;
    
    this.initializeDefaultPatterns();
  }

  /**
   * Initialize common API patterns for matching
   */
  private initializeDefaultPatterns(): void {
    const defaultPatterns: APIPattern[] = [
      {
        id: 'auth_bearer_token',
        pattern: 'Bearer token authentication',
        category: 'authentication',
        description: 'Standard Bearer token authentication pattern',
        examples: [
          'Authorization: Bearer your-token-here',
          'curl -H "Authorization: Bearer ${TOKEN}" api.example.com/data'
        ],
        weight: 1.0
      },
      {
        id: 'auth_api_key',
        pattern: 'API key authentication',
        category: 'authentication',
        description: 'API key authentication via header or query parameter',
        examples: [
          'X-API-Key: your-api-key',
          'api.example.com/data?api_key=${API_KEY}'
        ],
        weight: 1.0
      },
      {
        id: 'data_pagination',
        pattern: 'Paginated data retrieval',
        category: 'data_access',
        description: 'Paginated API responses with cursor or offset',
        examples: [
          'GET /api/v1/items?page=1&limit=20',
          'GET /api/v1/items?cursor=abc123&limit=50'
        ],
        weight: 0.9
      },
      {
        id: 'data_filtering',
        pattern: 'Data filtering and search',
        category: 'data_access',
        description: 'API endpoints with filtering, searching, and querying capabilities',
        examples: [
          'GET /api/v1/users?filter=active&search=john',
          'POST /api/v1/search {"query": "keyword", "filters": {"status": "active"}}'
        ],
        weight: 0.8
      },
      {
        id: 'streaming_data',
        pattern: 'Real-time streaming data',
        category: 'streaming',
        description: 'Server-sent events or WebSocket streaming',
        examples: [
          'GET /api/v1/stream (text/event-stream)',
          'WebSocket: wss://api.example.com/ws'
        ],
        weight: 0.7
      },
      {
        id: 'batch_operations',
        pattern: 'Batch operations',
        category: 'batch',
        description: 'Bulk create, update, or delete operations',
        examples: [
          'POST /api/v1/batch {"operations": [{"method": "POST", "path": "/users", "body": {...}}]}',
          'PUT /api/v1/users/bulk {"users": [{"id": 1, "name": "New Name"}]}'
        ],
        weight: 0.6
      },
      {
        id: 'webhook_endpoints',
        pattern: 'Webhook registration and management',
        category: 'webhook',
        description: 'Webhook configuration and event delivery',
        examples: [
          'POST /api/v1/webhooks {"url": "https://your-app.com/webhook", "events": ["user.created"]}',
          'GET /api/v1/webhooks/{id}/deliveries'
        ],
        weight: 0.5
      }
    ];

    defaultPatterns.forEach(pattern => {
      // Generate simple vector representation (in production, use actual embeddings)
      pattern.vector = this.generateSimpleVector(pattern.pattern + ' ' + pattern.description);
      this.patterns.set(pattern.id, pattern);
    });
  }

  /**
   * Add or update an API pattern
   */
  addPattern(pattern: APIPattern): void {
    if (!pattern.vector) {
      pattern.vector = this.generateSimpleVector(pattern.pattern + ' ' + pattern.description);
    }
    this.patterns.set(pattern.id, pattern);
    this.emit('pattern_added', pattern);
  }

  /**
   * Remove an API pattern
   */
  removePattern(patternId: string): boolean {
    const removed = this.patterns.delete(patternId);
    if (removed) {
      this.emit('pattern_removed', patternId);
    }
    return removed;
  }

  /**
   * Search for similar API patterns
   */
  async search(query: string, options?: {
    limit?: number;
    minSimilarity?: number;
    categories?: APIPattern['category'][];
    sessionId?: string;
  }): Promise<PatternMatch[]> {
    const limit = options?.limit || 5;
    const minSimilarity = options?.minSimilarity || this.similarityThreshold;
    const categories = options?.categories;
    const sessionId = options?.sessionId || `search_${Date.now()}`;

    // Generate query vector
    const queryVector = this.generateSimpleVector(query);

    // Calculate similarities
    const matches: PatternMatch[] = [];
    
    for (const pattern of this.patterns.values()) {
      // Filter by category if specified
      if (categories && !categories.includes(pattern.category)) {
        continue;
      }

      const similarity = this.calculateCosineSimilarity(queryVector, pattern.vector!);
      
      if (similarity >= minSimilarity) {
        matches.push({
          pattern,
          similarity,
          confidence: this.calculateConfidence(similarity, pattern.weight),
          context: {
            endpoint: this.extractEndpoint(query),
            method: this.extractMethod(query),
            parameters: this.extractParameters(query)
          }
        });
      }
    }

    // Sort by similarity * weight (confidence)
    matches.sort((a, b) => b.confidence - a.confidence);

    // Limit results
    const limitedMatches = matches.slice(0, limit);

    // Emit search event
    const searchEvent: SemanticSearchEvent = {
      query,
      matches: limitedMatches,
      queryVector,
      timestamp: new Date().toISOString(),
      sessionId
    };

    this.emit('search', searchEvent);

    return limitedMatches;
  }

  /**
   * Get pattern analytics
   */
  getPatternAnalytics(): {
    totalPatterns: number;
    patternsByCategory: Record<APIPattern['category'], number>;
    mostSimilarPatterns: { pattern1: string; pattern2: string; similarity: number }[];
  } {
    const totalPatterns = this.patterns.size;
    const patternsByCategory: Record<APIPattern['category'], number> = {
      authentication: 0,
      data_access: 0,
      mutation: 0,
      streaming: 0,
      batch: 0,
      webhook: 0
    };

    // Count patterns by category
    for (const pattern of this.patterns.values()) {
      patternsByCategory[pattern.category]++;
    }

    // Find most similar pattern pairs
    const mostSimilarPatterns: { pattern1: string; pattern2: string; similarity: number }[] = [];
    const patternsArray = Array.from(this.patterns.values());
    
    for (let i = 0; i < patternsArray.length; i++) {
      for (let j = i + 1; j < patternsArray.length; j++) {
        const similarity = this.calculateCosineSimilarity(
          patternsArray[i].vector!,
          patternsArray[j].vector!
        );
        
        if (similarity > 0.5) {
          mostSimilarPatterns.push({
            pattern1: patternsArray[i].id,
            pattern2: patternsArray[j].id,
            similarity
          });
        }
      }
    }

    mostSimilarPatterns.sort((a, b) => b.similarity - a.similarity);

    return {
      totalPatterns,
      patternsByCategory,
      mostSimilarPatterns: mostSimilarPatterns.slice(0, 10)
    };
  }

  /**
   * Generate a simple vector representation (TF-IDF-like)
   * In production, use actual embedding models like sentence-transformers
   */
  private generateSimpleVector(text: string): number[] {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const vector = new Array(this.vectorDimensions).fill(0);
    
    // Simple hash-based vector generation
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      const position = Math.abs(hash) % this.vectorDimensions;
      vector[position] += 1 / Math.sqrt(words.length); // TF normalization
    });

    // L2 normalization
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same dimension');
    }

    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Calculate confidence score based on similarity and pattern weight
   */
  private calculateConfidence(similarity: number, weight: number): number {
    return similarity * weight;
  }

  /**
   * Simple hash function for consistent vector positioning
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  /**
   * Extract endpoint from query text
   */
  private extractEndpoint(query: string): string {
    const endpointMatch = query.match(/\/api\/[^\s]+/);
    return endpointMatch ? endpointMatch[0] : '';
  }

  /**
   * Extract HTTP method from query text
   */
  private extractMethod(query: string): string {
    const methodMatch = query.match(/\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/i);
    return methodMatch ? methodMatch[0].toUpperCase() : 'GET';
  }

  /**
   * Extract parameters from query text
   */
  private extractParameters(query: string): Record<string, any> | undefined {
    try {
      const jsonMatch = query.match(/\{[^}]+\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Ignore JSON parsing errors
    }

    // Extract query parameters
    const paramMatch = query.match(/\?([^}\s]+)/);
    if (paramMatch) {
      const params: Record<string, string> = {};
      const pairs = paramMatch[1].split('&');
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
          params[key] = decodeURIComponent(value);
        }
      }
      return Object.keys(params).length > 0 ? params : undefined;
    }

    return undefined;
  }
}