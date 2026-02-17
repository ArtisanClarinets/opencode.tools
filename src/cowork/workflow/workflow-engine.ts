import { v4 as uuidv4 } from 'uuid';
import { CoworkConfigManager } from 'src/cowork/config/cowork-config-manager';
import { PostgresPersistenceManager } from 'src/cowork/persistence/postgres-persistence-manager';
import { EventBus } from 'src/cowork/orchestrator/event-bus';

export interface WorkflowTransition {
  onEvent: string;
  fromStep: string;
  toStep: string;
}

export interface WorkflowDefinition {
  workflowType: string;
  startEvent: string;
  initialStep: string;
  transitions: WorkflowTransition[];
}

export interface WorkflowInstance {
  workflowInstanceId: string;
  workflowType: string;
  aggregateId: string;
  currentStep: string;
  status: 'running' | 'completed';
  state: Record<string, unknown>;
}

export class WorkflowEngine {
  private definitions = new Map<string, WorkflowDefinition>();
  private readonly tenantId: string;

  constructor(
    private readonly eventBus: EventBus,
    private readonly persistenceManager: PostgresPersistenceManager,
    private readonly configManager: CoworkConfigManager = CoworkConfigManager.getInstance()
  ) {
    this.tenantId = this.configManager.getPersistenceConfig().tenantId;
  }

  public async initialize(): Promise<void> {
    await this.persistenceManager.initialize();
    this.eventBus.subscribe('*', async (_payload, eventRecord) => {
      if (!eventRecord) {
        return;
      }

      await this.processEvent(eventRecord.type, eventRecord.aggregateId, eventRecord.payload as Record<string, unknown>);
    });
  }

  public registerDefinition(definition: WorkflowDefinition): void {
    this.definitions.set(definition.workflowType, definition);
  }

  public async startWorkflow(workflowType: string, aggregateId: string, seedState?: Record<string, unknown>): Promise<WorkflowInstance> {
    const definition = this.definitions.get(workflowType);
    if (!definition) {
      throw new Error(`Workflow definition not found: ${workflowType}`);
    }

    const now = new Date().toISOString();
    const instance: WorkflowInstance = {
      workflowInstanceId: `wf-${uuidv4()}`,
      workflowType,
      aggregateId,
      currentStep: definition.initialStep,
      status: 'running',
      state: seedState || {}
    };

    await this.persistenceManager.upsertWorkflowInstance({
      workflowInstanceId: instance.workflowInstanceId,
      tenantId: this.tenantId,
      workflowType: instance.workflowType,
      aggregateId,
      status: instance.status,
      currentStep: instance.currentStep,
      state: instance.state,
      createdAt: now,
      updatedAt: now
    });

    await this.persistenceManager.appendWorkflowHistory({
      id: uuidv4(),
      workflowInstanceId: instance.workflowInstanceId,
      tenantId: this.tenantId,
      eventType: 'workflow:started',
      fromStep: null,
      toStep: instance.currentStep,
      payload: seedState || {},
      createdAt: now
    });

    return instance;
  }

  public async advanceWorkflow(
    workflowInstanceId: string,
    eventType: string,
    payload: Record<string, unknown>
  ): Promise<WorkflowInstance | null> {
    const current = await this.persistenceManager.getWorkflowInstance(workflowInstanceId, this.tenantId);
    if (!current) {
      return null;
    }

    const definition = this.definitions.get(current.workflowType);
    if (!definition) {
      return null;
    }

    const transition = definition.transitions.find(
      (candidate) => candidate.onEvent === eventType && candidate.fromStep === current.currentStep
    );

    if (!transition) {
      return {
        workflowInstanceId: current.workflowInstanceId,
        workflowType: current.workflowType,
        aggregateId: current.aggregateId,
        currentStep: current.currentStep,
        status: current.status as 'running' | 'completed',
        state: current.state
      };
    }

    const nextStatus = transition.toStep === 'done' ? 'completed' : 'running';
    const now = new Date().toISOString();
    const mergedState = { ...current.state, ...payload };

    await this.persistenceManager.upsertWorkflowInstance({
      ...current,
      status: nextStatus,
      currentStep: transition.toStep,
      state: mergedState,
      updatedAt: now
    });

    await this.persistenceManager.appendWorkflowHistory({
      id: uuidv4(),
      workflowInstanceId,
      tenantId: this.tenantId,
      eventType,
      fromStep: current.currentStep,
      toStep: transition.toStep,
      payload,
      createdAt: now
    });

    return {
      workflowInstanceId,
      workflowType: current.workflowType,
      aggregateId: current.aggregateId,
      currentStep: transition.toStep,
      status: nextStatus,
      state: mergedState
    };
  }

  public async processEvent(eventType: string, aggregateId: string, payload: Record<string, unknown>): Promise<void> {
    const startable = Array.from(this.definitions.values()).filter((definition) => definition.startEvent === eventType);
    for (const definition of startable) {
      await this.startWorkflow(definition.workflowType, aggregateId, payload);
    }
  }
}

export const WORKSPACE_PROVISIONING_WORKFLOW: WorkflowDefinition = {
  workflowType: 'workspace-provisioning',
  startEvent: 'workspace:created',
  initialStep: 'provisioning',
  transitions: [
    { onEvent: 'workspace:hydrated', fromStep: 'provisioning', toStep: 'ready' },
    { onEvent: 'workspace:reviewed', fromStep: 'ready', toStep: 'done' }
  ]
};

export const BLACKBOARD_REVIEW_WORKFLOW: WorkflowDefinition = {
  workflowType: 'blackboard-review-publish',
  startEvent: 'blackboard:entry:created',
  initialStep: 'in-review',
  transitions: [
    { onEvent: 'blackboard:entry:approved', fromStep: 'in-review', toStep: 'ready-to-publish' },
    { onEvent: 'blackboard:entry:published', fromStep: 'ready-to-publish', toStep: 'done' }
  ]
};
