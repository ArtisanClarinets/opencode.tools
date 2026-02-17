import { foundryInitialState, foundryReducer } from 'src/tui-foundry/store/store';

describe('foundry reducer', () => {
  it('stores a foundry run as active', () => {
    const next = foundryReducer(foundryInitialState, {
      type: 'FOUNDRY_RUN_STARTED',
      run: {
        runId: 'r1',
        projectId: 'p1',
        objective: 'build',
        status: 'running',
        updatedAt: new Date().toISOString()
      }
    });

    expect(next.activeRunId).toBe('r1');
    expect(next.foundryRuns.r1.status).toBe('running');
  });
});
