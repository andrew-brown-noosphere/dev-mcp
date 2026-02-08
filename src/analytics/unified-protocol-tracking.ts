import { EventEmitter } from 'events';

export interface UnifiedProtocolEvent {
  id: string;
  protocol: 'http' | 'sse' | 'websocket' | 'stdio' | 'grpc';
  transport: 'request-response' | 'streaming' | 'bidirectional';
  endpoint: string;
  method?: string;
  statusCode?: number;
  duration_ms: number;
  timestamp: string;
  sessionId: string;
  metadata: {
    userAgent?: string;
    contentType?: string;
    responseSize?: number;
    errorMessage?: string;
    routing?: {
      strategy: 'semantic' | 'round-robin' | 'least-loaded' | 'sticky';
      selectedServer?: string;
      totalServers?: number;
    };
  };
}

export interface GroupAnalytics {
  groupId: string;
  totalRequests: number;
  successRate: number;
  averageLatency: number;
  protocolDistribution: Record<UnifiedProtocolEvent['protocol'], number>;
  transportDistribution: Record<UnifiedProtocolEvent['transport'], number>;
  topEndpoints: { endpoint: string; count: number; avgLatency: number }[];
  errorPatterns: { pattern: string; count: number; examples: string[] }[];
  timeWindowHours: number;
}

export interface RoutingDecision {
  requestId: string;
  strategy: 'semantic' | 'round-robin' | 'least-loaded' | 'sticky';
  availableServers: string[];
  selectedServer: string;
  selectionReason: string;
  loadFactors?: Record<string, number>;
  semanticScore?: number;
}

export class UnifiedProtocolTracker extends EventEmitter {
  private events: Map<string, UnifiedProtocolEvent> = new Map();
  private groups: Map<string, Set<string>> = new Map(); // groupId -> eventIds
  private routingDecisions: Map<string, RoutingDecision> = new Map();
  private maxEvents: number = 10000;
  private cleanupInterval: number = 300000; // 5 minutes
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config?: {
    maxEvents?: number;
    cleanupInterval?: number;
  }) {
    super();
    this.maxEvents = config?.maxEvents || 10000;
    this.cleanupInterval = config?.cleanupInterval || 300000;
    
    this.startCleanupTimer();
  }

  /**
   * Track a unified protocol event
   */
  trackEvent(event: Omit<UnifiedProtocolEvent, 'id' | 'timestamp'>): string {
    const eventId = `${event.protocol}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const fullEvent: UnifiedProtocolEvent = {
      ...event,
      id: eventId,
      timestamp: new Date().toISOString()
    };

    this.events.set(eventId, fullEvent);
    this.emit('event', fullEvent);

    // Cleanup old events if we exceed the limit
    if (this.events.size > this.maxEvents) {
      this.cleanupOldEvents();
    }

    return eventId;
  }

  /**
   * Track HTTP request
   */
  trackHTTPRequest(request: {
    endpoint: string;
    method: string;
    statusCode: number;
    duration_ms: number;
    sessionId: string;
    userAgent?: string;
    contentType?: string;
    responseSize?: number;
    routing?: UnifiedProtocolEvent['metadata']['routing'];
  }): string {
    return this.trackEvent({
      protocol: 'http',
      transport: 'request-response',
      endpoint: request.endpoint,
      method: request.method,
      statusCode: request.statusCode,
      duration_ms: request.duration_ms,
      sessionId: request.sessionId,
      metadata: {
        userAgent: request.userAgent,
        contentType: request.contentType,
        responseSize: request.responseSize,
        routing: request.routing
      }
    });
  }

  /**
   * Track Server-Sent Events stream
   */
  trackSSEStream(stream: {
    endpoint: string;
    duration_ms: number;
    sessionId: string;
    messageCount?: number;
    userAgent?: string;
  }): string {
    return this.trackEvent({
      protocol: 'sse',
      transport: 'streaming',
      endpoint: stream.endpoint,
      duration_ms: stream.duration_ms,
      sessionId: stream.sessionId,
      metadata: {
        userAgent: stream.userAgent,
        responseSize: stream.messageCount
      }
    });
  }

  /**
   * Track WebSocket connection
   */
  trackWebSocketConnection(connection: {
    endpoint: string;
    duration_ms: number;
    sessionId: string;
    messagesExchanged?: number;
    disconnectReason?: string;
  }): string {
    return this.trackEvent({
      protocol: 'websocket',
      transport: 'bidirectional',
      endpoint: connection.endpoint,
      duration_ms: connection.duration_ms,
      sessionId: connection.sessionId,
      metadata: {
        responseSize: connection.messagesExchanged,
        errorMessage: connection.disconnectReason
      }
    });
  }

  /**
   * Track STDIO MCP communication
   */
  trackSTDIOCommunication(communication: {
    endpoint: string; // MCP method name
    duration_ms: number;
    sessionId: string;
    success: boolean;
    errorMessage?: string;
  }): string {
    return this.trackEvent({
      protocol: 'stdio',
      transport: 'bidirectional',
      endpoint: communication.endpoint,
      statusCode: communication.success ? 200 : 500,
      duration_ms: communication.duration_ms,
      sessionId: communication.sessionId,
      metadata: {
        errorMessage: communication.errorMessage
      }
    });
  }

  /**
   * Track gRPC call
   */
  trackGRPCCall(call: {
    endpoint: string; // service.method
    statusCode: number;
    duration_ms: number;
    sessionId: string;
    messageSize?: number;
    isStreaming?: boolean;
  }): string {
    return this.trackEvent({
      protocol: 'grpc',
      transport: call.isStreaming ? 'streaming' : 'request-response',
      endpoint: call.endpoint,
      statusCode: call.statusCode,
      duration_ms: call.duration_ms,
      sessionId: call.sessionId,
      metadata: {
        responseSize: call.messageSize
      }
    });
  }

  /**
   * Add event to a group for analytics
   */
  addEventToGroup(eventId: string, groupId: string): void {
    if (!this.events.has(eventId)) {
      throw new Error(`Event ${eventId} not found`);
    }

    if (!this.groups.has(groupId)) {
      this.groups.set(groupId, new Set());
    }

    this.groups.get(groupId)!.add(eventId);
    this.emit('group_updated', { groupId, eventId });
  }

  /**
   * Record a routing decision
   */
  recordRoutingDecision(decision: RoutingDecision): void {
    this.routingDecisions.set(decision.requestId, decision);
    this.emit('routing_decision', decision);
  }

  /**
   * Get analytics for a specific group
   */
  getGroupAnalytics(groupId: string, timeWindowHours: number = 24): GroupAnalytics | null {
    const eventIds = this.groups.get(groupId);
    if (!eventIds || eventIds.size === 0) {
      return null;
    }

    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    const relevantEvents = Array.from(eventIds)
      .map(id => this.events.get(id))
      .filter((event): event is UnifiedProtocolEvent => 
        event !== undefined && new Date(event.timestamp) > cutoffTime
      );

    if (relevantEvents.length === 0) {
      return null;
    }

    // Calculate basic metrics
    const totalRequests = relevantEvents.length;
    const successfulRequests = relevantEvents.filter(e => 
      !e.statusCode || (e.statusCode >= 200 && e.statusCode < 400)
    ).length;
    const successRate = successfulRequests / totalRequests;
    const averageLatency = relevantEvents.reduce((sum, e) => sum + e.duration_ms, 0) / totalRequests;

    // Protocol distribution
    const protocolDistribution: Record<UnifiedProtocolEvent['protocol'], number> = {
      http: 0, sse: 0, websocket: 0, stdio: 0, grpc: 0
    };
    relevantEvents.forEach(e => protocolDistribution[e.protocol]++);

    // Transport distribution
    const transportDistribution: Record<UnifiedProtocolEvent['transport'], number> = {
      'request-response': 0, streaming: 0, bidirectional: 0
    };
    relevantEvents.forEach(e => transportDistribution[e.transport]++);

    // Top endpoints
    const endpointStats = new Map<string, { count: number; totalLatency: number }>();
    relevantEvents.forEach(e => {
      const current = endpointStats.get(e.endpoint) || { count: 0, totalLatency: 0 };
      endpointStats.set(e.endpoint, {
        count: current.count + 1,
        totalLatency: current.totalLatency + e.duration_ms
      });
    });

    const topEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        count: stats.count,
        avgLatency: stats.totalLatency / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Error patterns
    const errorEvents = relevantEvents.filter(e => 
      e.statusCode && (e.statusCode >= 400 || e.metadata.errorMessage)
    );
    
    const errorPatterns = new Map<string, { count: number; examples: string[] }>();
    errorEvents.forEach(e => {
      const pattern = e.statusCode ? `HTTP_${e.statusCode}` : 'UNKNOWN_ERROR';
      const current = errorPatterns.get(pattern) || { count: 0, examples: [] };
      errorPatterns.set(pattern, {
        count: current.count + 1,
        examples: [...current.examples, e.metadata.errorMessage || `${e.endpoint}`].slice(0, 3)
      });
    });

    return {
      groupId,
      totalRequests,
      successRate,
      averageLatency,
      protocolDistribution,
      transportDistribution,
      topEndpoints,
      errorPatterns: Array.from(errorPatterns.entries())
        .map(([pattern, data]) => ({ pattern, count: data.count, examples: data.examples }))
        .sort((a, b) => b.count - a.count),
      timeWindowHours
    };
  }

  /**
   * Get routing analytics
   */
  getRoutingAnalytics(timeWindowHours: number = 24): {
    totalDecisions: number;
    strategyDistribution: Record<RoutingDecision['strategy'], number>;
    serverUtilization: Record<string, number>;
    averageSemanticScore: number;
  } {
    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    const recentDecisions = Array.from(this.routingDecisions.values())
      .filter(d => new Date(d.requestId.split('_')[1] || 0) > cutoffTime);

    const totalDecisions = recentDecisions.length;
    
    // Strategy distribution
    const strategyDistribution: Record<RoutingDecision['strategy'], number> = {
      semantic: 0, 'round-robin': 0, 'least-loaded': 0, sticky: 0
    };
    recentDecisions.forEach(d => strategyDistribution[d.strategy]++);

    // Server utilization
    const serverUtilization: Record<string, number> = {};
    recentDecisions.forEach(d => {
      serverUtilization[d.selectedServer] = (serverUtilization[d.selectedServer] || 0) + 1;
    });

    // Average semantic score
    const semanticDecisions = recentDecisions.filter(d => d.semanticScore !== undefined);
    const averageSemanticScore = semanticDecisions.length > 0
      ? semanticDecisions.reduce((sum, d) => sum + (d.semanticScore || 0), 0) / semanticDecisions.length
      : 0;

    return {
      totalDecisions,
      strategyDistribution,
      serverUtilization,
      averageSemanticScore
    };
  }

  /**
   * Clean up old events to prevent memory leaks
   */
  private cleanupOldEvents(): void {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    const eventsToDelete: string[] = [];

    for (const [id, event] of this.events.entries()) {
      if (new Date(event.timestamp) < cutoffTime) {
        eventsToDelete.push(id);
      }
    }

    // Remove from events map
    eventsToDelete.forEach(id => {
      this.events.delete(id);
      
      // Remove from groups
      for (const [groupId, eventIds] of this.groups.entries()) {
        eventIds.delete(id);
        if (eventIds.size === 0) {
          this.groups.delete(groupId);
        }
      }
    });

    if (eventsToDelete.length > 0) {
      this.emit('cleanup', { deletedEvents: eventsToDelete.length });
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupOldEvents();
    }, this.cleanupInterval);
  }

  /**
   * Shutdown and cleanup
   */
  shutdown(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cleanupOldEvents();
  }

  /**
   * Get current statistics
   */
  getStats(): {
    totalEvents: number;
    totalGroups: number;
    totalRoutingDecisions: number;
    oldestEventAge: number;
    memoryUsage: number;
  } {
    const now = Date.now();
    let oldestEventAge = 0;

    if (this.events.size > 0) {
      const oldestEvent = Array.from(this.events.values())
        .reduce((oldest, event) => 
          new Date(event.timestamp) < new Date(oldest.timestamp) ? event : oldest
        );
      oldestEventAge = now - new Date(oldestEvent.timestamp).getTime();
    }

    return {
      totalEvents: this.events.size,
      totalGroups: this.groups.size,
      totalRoutingDecisions: this.routingDecisions.size,
      oldestEventAge,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimate memory usage in bytes
   */
  private estimateMemoryUsage(): number {
    // Rough estimation based on JSON size
    const eventsSize = JSON.stringify(Array.from(this.events.values())).length;
    const groupsSize = JSON.stringify(Array.from(this.groups.entries())).length;
    const routingSize = JSON.stringify(Array.from(this.routingDecisions.values())).length;
    
    return eventsSize + groupsSize + routingSize;
  }
}