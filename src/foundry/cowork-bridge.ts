import { CoworkOrchestrator } from 'src/cowork/orchestrator/cowork-orchestrator';
import { EventBus } from 'src/cowork/orchestrator/event-bus';

export interface FoundryRunRequest {
  projectId: string;
  objective: string;
  initiatedBy?: string;
}

export interface FoundryRunRecord {
  runId: string;
  projectId: string;
  objective: string;
  status: 'running' | 'paused' | 'aborted' | 'completed';
  startedAt: string;
  updatedAt: string;
}

/**
 * Shared Foundry <-> Cowork bridge used by CLI/TUI runtime.
 */
export class FoundryCoworkBridge {
  private readonly orchestrator: CoworkOrchestrator;
  private readonly eventBus: EventBus;

  constructor(orchestrator?: CoworkOrchestrator) {
    this.orchestrator = orchestrator ?? CoworkOrchestrator.getInstance();
    this.eventBus = EventBus.getInstance();
  }

  public getOrchestrator(): CoworkOrchestrator {
    return this.orchestrator;
  }

  public async warmUp(): Promise<void> {
    await this.eventBus.publish('foundry:bridge:warmed', {
      timestamp: new Date().toISOString()
    });
  }

  public async startRun(request: FoundryRunRequest): Promise<FoundryRunRecord> {
    const now = new Date().toISOString();
    const run: FoundryRunRecord = {
      runId: `${request.projectId}-${Date.now()}`,
      projectId: request.projectId,
      objective: request.objective,
      status: 'running',
      startedAt: now,
      updatedAt: now
    };

    await this.eventBus.publish('foundry:run:started', run);
    return run;
  }

  public async emitRunEvent(event: string, payload: unknown): Promise<void> {
    await this.eventBus.publish(event, payload);
  }
}

let warmedBridge: FoundryCoworkBridge | null = null;

export async function createWarmedUpBridge(): Promise<FoundryCoworkBridge> {
  if (!warmedBridge) {
    warmedBridge = new FoundryCoworkBridge(CoworkOrchestrator.getInstance());
    await warmedBridge.warmUp();
  }

  return warmedBridge;
}

export function resetWarmedUpBridgeForTests(): void {
  warmedBridge = null;
}
