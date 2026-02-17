import { v4 as uuidv4 } from 'uuid';
import { CoworkConfigManager } from 'src/cowork/config/cowork-config-manager';
import { PostgresPersistenceManager } from 'src/cowork/persistence/postgres-persistence-manager';
import { EventBus } from './event-bus';

/**
 * Shared Context (Blackboard) for real-time collaboration
 */

export interface Artifact<T = unknown> {
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
  private persistenceManager: PostgresPersistenceManager | null = null;
  private workspaceId: string | null = null;
  private tenantId: string;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.tenantId = CoworkConfigManager.getInstance().getPersistenceConfig().tenantId;
  }

  public static getInstance(): Blackboard {
    if (!Blackboard.instance) {
      Blackboard.instance = new Blackboard();
    }
    return Blackboard.instance;
  }

  public async configurePersistence(persistenceManager: PostgresPersistenceManager, workspaceId: string): Promise<void> {
    this.persistenceManager = persistenceManager;
    this.workspaceId = workspaceId;
    await this.persistenceManager.initialize();
  }

  public hydrateFromPersistence(artifacts: Artifact[]): void {
    this.artifacts.clear();
    for (const artifact of artifacts) {
      this.artifacts.set(artifact.key, artifact);
    }
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
    void this.eventBus.publish(`artifact:updated:${key}`, artifact);
    void this.eventBus.publish('artifact:any:updated', artifact);
    void this.eventBus.publish('blackboard:entry:created', artifact, {
      aggregateId: this.workspaceId || key,
      aggregateType: 'blackboard',
      version: 1
    });
    this.persistArtifact(artifact).catch((error: unknown) => {
      console.error('Blackboard persistence failed', error);
    });
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
    void this.eventBus.publish('feedback:added', feedback, {
      aggregateId: this.workspaceId || targetId,
      aggregateType: 'feedback',
      version: 1
    });
  }

  public getFeedbacks(): FeedbackEntry[] {
    return [...this.feedbacks];
  }

  public transitionTo(newState: ProjectStatus): void {
    const oldState = this.state;
    this.state = newState;
    void this.eventBus.publish('state:transition', { from: oldState, to: newState }, {
      aggregateId: this.workspaceId || 'project',
      aggregateType: 'workspace',
      version: 1
    });
  }

  public getState(): ProjectStatus {
    return this.state;
  }

  public clear(): void {
    this.artifacts.clear();
    this.feedbacks = [];
    this.state = 'drafting';
  }

  private async persistArtifact<T>(artifact: Artifact<T>): Promise<void> {
    if (!this.persistenceManager || !this.workspaceId) {
      return;
    }

    const version = await this.persistenceManager.getNextEntryVersion(this.workspaceId, artifact.key, this.tenantId);
    await this.persistenceManager.upsertBlackboardEntry({
      id: uuidv4(),
      workspaceId: this.workspaceId,
      tenantId: this.tenantId,
      entryType: artifact.type,
      entryKey: artifact.key,
      payload: artifact.data,
      version,
      createdBy: artifact.source,
      createdAt: artifact.timestamp
    });
  }
}
