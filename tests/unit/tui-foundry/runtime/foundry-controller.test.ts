import { CoworkOrchestrator } from 'src/cowork/orchestrator/cowork-orchestrator';
import { resetWarmedUpBridgeForTests } from 'src/foundry/cowork-bridge';
import { FoundryController } from 'src/tui-foundry/runtime/controllers/foundry-controller';

describe('FoundryController', () => {
  beforeEach(() => {
    resetWarmedUpBridgeForTests();
    CoworkOrchestrator.resetInstanceForTests();
  });

  it('can start and pause executions', async () => {
    const controller = new FoundryController();
    const run = await controller.startExecution({ projectId: 'p1', objective: 'ship' });

    const paused = controller.pauseExecution(run.runId);

    expect(paused?.status).toBe('paused');
  });
});
