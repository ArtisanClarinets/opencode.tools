import { EventBus } from 'src/cowork/orchestrator/event-bus';
import { createWarmedUpBridge } from 'src/foundry/cowork-bridge';
import { coworkAdapter } from 'src/tui-foundry/cowork/adapter';
import { CoworkController } from 'src/tui-foundry/runtime/controllers/cowork-controller';
import { FoundryController } from 'src/tui-foundry/runtime/controllers/foundry-controller';

export class TuiRuntime {
  public readonly eventBus: EventBus;
  public readonly foundryController: FoundryController;
  public readonly coworkController: CoworkController;

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.foundryController = new FoundryController();
    this.coworkController = new CoworkController(coworkAdapter);
  }

  public async initialize(): Promise<void> {
    const bridge = await createWarmedUpBridge();
    await coworkAdapter.initialize(bridge.getOrchestrator());
  }
}

let runtime: TuiRuntime | null = null;

export async function getTuiRuntime(): Promise<TuiRuntime> {
  if (!runtime) {
    runtime = new TuiRuntime();
    await runtime.initialize();
  }

  return runtime;
}

export function resetTuiRuntimeForTests(): void {
  runtime = null;
}
