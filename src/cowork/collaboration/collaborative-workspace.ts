import { v4 as uuidv4 } from 'uuid';
import { CoworkConfigManager } from 'src/cowork/config/cowork-config-manager';
import { PostgresPersistenceManager } from 'src/cowork/persistence/postgres-persistence-manager';
import { Blackboard } from 'src/cowork/orchestrator/blackboard';
import { EventBus } from 'src/cowork/orchestrator/event-bus';

export interface WorkspaceMetadata {
  id: string;
  name: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export class CollaborativeWorkspace {
  private readonly eventBus: EventBus;

  constructor(
    private readonly persistence: PostgresPersistenceManager,
    private readonly configManager: CoworkConfigManager = CoworkConfigManager.getInstance(),
    private readonly blackboard: Blackboard = Blackboard.getInstance()
  ) {
    this.eventBus = EventBus.getInstance();
  }

  public async initialize(): Promise<void> {
    await this.persistence.initialize();
    await this.eventBus.configurePersistence(this.persistence);
  }

  public async createWorkspace(name: string): Promise<WorkspaceMetadata> {
    const now = new Date().toISOString();
    const tenantId = this.configManager.getPersistenceConfig().tenantId;
    const workspace: WorkspaceMetadata = {
      id: `ws-${uuidv4()}`,
      name,
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    await this.persistence.createWorkspace({
      id: workspace.id,
      tenantId,
      name: workspace.name,
      status: workspace.status,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt
    });

    await this.eventBus.publish('workspace:created', workspace, {
      aggregateId: workspace.id,
      aggregateType: 'workspace',
      version: 1
    });

    return workspace;
  }

  public async openWorkspace(workspaceId: string): Promise<WorkspaceMetadata | null> {
    const tenantId = this.configManager.getPersistenceConfig().tenantId;
    const workspace = await this.persistence.getWorkspaceById(workspaceId, tenantId);

    if (!workspace) {
      return null;
    }

    await this.blackboard.configurePersistence(this.persistence, workspace.id);
    const entries = await this.persistence.listLatestBlackboardEntries(workspaceId, tenantId);
    this.blackboard.hydrateFromPersistence(entries.map((entry) => ({
      id: entry.id,
      key: entry.entryKey,
      type: entry.entryType,
      source: entry.createdBy,
      timestamp: entry.createdAt,
      data: entry.payload
    })));

    await this.eventBus.publish('workspace:hydrated', { workspaceId }, {
      aggregateId: workspaceId,
      aggregateType: 'workspace',
      version: 1
    });

    return {
      id: workspace.id,
      name: workspace.name,
      status: workspace.status as 'active' | 'archived',
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt
    };
  }

  public async createCheckpoint(workspaceId: string, createdBy: string, metadata: Record<string, unknown>): Promise<string> {
    const tenantId = this.configManager.getPersistenceConfig().tenantId;
    const checkpointId = `chk-${uuidv4()}`;

    await this.persistence.createWorkspaceSnapshot({
      id: checkpointId,
      workspaceId,
      tenantId,
      createdBy,
      metadata,
      createdAt: new Date().toISOString()
    });

    await this.eventBus.publish('workspace:checkpoint:created', { workspaceId, checkpointId, metadata }, {
      aggregateId: workspaceId,
      aggregateType: 'workspace',
      version: 1
    });

    return checkpointId;
  }
}
