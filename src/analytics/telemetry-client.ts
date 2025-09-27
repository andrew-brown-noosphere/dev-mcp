import { EventEmitter } from 'events';

export interface JourneyEvent {
  eventType: 'query' | 'schema_discovery' | 'optimization' | 'migration' | 'connection' | 'error' | 'conversion' | 'llms_txt_evaluator';
  eventData: {
    tool: string;
    action: string;
    duration_ms: number;
    result: 'success' | 'failure';
    metadata?: Record<string, any>;
  };
  context: {
    sessionId: string;
    mcpServerId: string;
    environment: string;
    timestamp: string;
  };
}

export interface JourneyMilestone {
  milestoneType: 'explore' | 'adopt' | 'dev' | 'prod' | 'llms_txt_evaluator_lead_captured' | 'high_value_lead_captured';
  metadata: Record<string, any>;
}

export class TelemetryClient extends EventEmitter {
  private events: JourneyEvent[] = [];
  private milestones: JourneyMilestone[] = [];
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;
  private analyticsEndpoint: string;
  private apiKey?: string;

  constructor(config: {
    analyticsEndpoint: string;
    apiKey?: string;
    batchSize?: number;
    flushInterval?: number;
  }) {
    super();
    this.analyticsEndpoint = config.analyticsEndpoint;
    this.apiKey = config.apiKey;
    this.batchSize = config.batchSize || 10;
    this.flushInterval = config.flushInterval || 30000;
    
    this.startAutoFlush();
  }

  /**
   * Track a journey event
   */
  track(event: JourneyEvent): void {
    this.events.push({
      ...event,
      context: {
        ...event.context,
        timestamp: new Date().toISOString()
      }
    });

    this.emit('event', event);

    // Auto-flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Track a milestone in the AI adoption journey
   */
  trackMilestone(milestoneType: JourneyMilestone['milestoneType'], metadata: Record<string, any>): void {
    const milestone: JourneyMilestone = {
      milestoneType,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    };

    this.milestones.push(milestone);
    this.emit('milestone', milestone);

    // Important milestones should be flushed immediately
    if (milestoneType === 'prod' || milestoneType === 'high_value_lead_captured') {
      this.flush();
    }
  }

  /**
   * Manually flush all pending events
   */
  async flush(): Promise<void> {
    if (this.events.length === 0 && this.milestones.length === 0) {
      return;
    }

    const payload = {
      events: [...this.events],
      milestones: [...this.milestones],
      timestamp: new Date().toISOString()
    };

    // Clear local buffers
    this.events = [];
    this.milestones = [];

    try {
      const response = await fetch(this.analyticsEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.emit('flush', payload);
    } catch (error) {
      console.error('Failed to flush telemetry data:', error);
      this.emit('error', error);
      
      // Re-add events to buffer on failure (with limit to prevent memory leak)
      this.events = [...payload.events.slice(-this.batchSize), ...this.events];
      this.milestones = [...payload.milestones.slice(-this.batchSize), ...this.milestones];
    }
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop auto-flush and flush remaining events
   */
  async shutdown(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    await this.flush();
  }

  /**
   * Get current event count
   */
  getPendingEventCount(): number {
    return this.events.length + this.milestones.length;
  }

  /**
   * Helper method for journey progression tracking
   */
  trackJourneyProgression(from: string, to: string, metadata?: Record<string, any>): void {
    this.track({
      eventType: 'query',
      eventData: {
        tool: 'journey_tracker',
        action: 'progression',
        duration_ms: 0,
        result: 'success',
        metadata: {
          from_stage: from,
          to_stage: to,
          ...metadata
        }
      },
      context: {
        sessionId: metadata?.sessionId || `session_${Date.now()}`,
        mcpServerId: 'journey_tracker',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
      }
    });
  }
}