import { CoworkOrchestrator } from 'src/cowork/orchestrator/cowork-orchestrator';
import { createWarmedUpBridge, resetWarmedUpBridgeForTests } from 'src/foundry/cowork-bridge';

describe('Foundry bridge singleton', () => {
  beforeEach(() => {
    resetWarmedUpBridgeForTests();
    CoworkOrchestrator.resetInstanceForTests();
  });

  it('returns the same warmed bridge instance', async () => {
    const first = await createWarmedUpBridge();
    const second = await createWarmedUpBridge();

    expect(first).toBe(second);
    expect(first.getOrchestrator()).toBe(second.getOrchestrator());
  });
});
