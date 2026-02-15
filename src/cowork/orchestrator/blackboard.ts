import { EventBus } from './event-bus';

/**
 * Shared Context (Blackboard) for real-time collaboration
 */

export interface Artifact<T = any> {
  id: string;
  type: string;
  key: string;
  data: T;
  source: string;
  timestamp: string;
}

export interface FeedbackEntry {
  id: string;
  from: string;
  targetId: string;
  content: string;
  severity: 'nit' | 'blocking' | 'critical';
  status: 'pending' | 'addressed';
  timestamp: string;
}

export type ProjectStatus = 'drafting' | 'planning' | 'implementing' | 'validating' | 'completed' | 'failed';

export class Blackboard {
  private static instance: Blackboard;
  private artifacts: Map<string, Artifact> = new Map();
  private feedbacks: FeedbackEntry[] = [];
  private state: ProjectStatus = 'drafting';
  private eventBus: EventBus;

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  public static getInstance(): Blackboard {
    if (!Blackboard.instance) {
      Blackboard.instance = new Blackboard();
    }
    return Blackboard.instance;
  }

  public getArtifact<T>(key: string): T | undefined {
    return this.artifacts.get(key)?.data as T;
  }

  public getAllArtifacts(): Artifact[] {
    return Array.from(this.artifacts.values());
  }

  public updateArtifact<T>(key: string, data: T, source: string, type: string): void {
    const artifact: Artifact<T> = {
      id: `${type}-${key}-${Date.now()}`,
      type,
      key,
      data,
      source,
      timestamp: new Date().toISOString()
    };
    this.artifacts.set(key, artifact);
    this.eventBus.publish(`artifact:updated:${key}`, artifact);
    this.eventBus.publish('artifact:any:updated', artifact);
  }

  public addFeedback(from: string, targetId: string, content: string, severity: FeedbackEntry['severity']): void {
    const feedback: FeedbackEntry = {
      id: `fb-${Date.now()}`,
      from,
      targetId,
      content,
      severity,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    this.feedbacks.push(feedback);
    this.eventBus.publish('feedback:added', feedback);
  }

  public getFeedbacks(): FeedbackEntry[] {
    return [...this.feedbacks];
  }

  public transitionTo(newState: ProjectStatus): void {
    const oldState = this.state;
    this.state = newState;
    this.eventBus.publish('state:transition', { from: oldState, to: newState });
  }

  public getState(): ProjectStatus {
    return this.state;
  }

  public clear(): void {
    this.artifacts.clear();
    this.feedbacks = [];
    this.state = 'drafting';
  }
}
