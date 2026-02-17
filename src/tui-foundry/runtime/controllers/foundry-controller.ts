import { createWarmedUpBridge, FoundryRunRequest } from 'src/foundry/cowork-bridge';
import { FoundryRunView, GateRunView, ReviewView } from 'src/tui-foundry/types';

export class FoundryController {
  private runs: Record<string, FoundryRunView> = {};

  public async startExecution(request: FoundryRunRequest): Promise<FoundryRunView> {
    const bridge = await createWarmedUpBridge();
    const run = await bridge.startRun(request);
    const runView: FoundryRunView = {
      runId: run.runId,
      projectId: run.projectId,
      objective: run.objective,
      status: run.status,
      updatedAt: run.updatedAt
    };

    this.runs[runView.runId] = runView;
    return runView;
  }

  public async resumeExecution(projectId: string, resumeKey: string): Promise<FoundryRunView> {
    return this.startExecution({ projectId, objective: `Resume ${resumeKey}` });
  }

  public abortExecution(runId: string): FoundryRunView | null {
    const run = this.runs[runId];
    if (!run) {
      return null;
    }

    const updated = { ...run, status: 'aborted' as const, updatedAt: new Date().toISOString() };
    this.runs[runId] = updated;
    return updated;
  }

  public pauseExecution(runId: string): FoundryRunView | null {
    const run = this.runs[runId];
    if (!run) {
      return null;
    }

    const updated = { ...run, status: 'paused' as const, updatedAt: new Date().toISOString() };
    this.runs[runId] = updated;
    return updated;
  }

  public runQualityGates(projectId: string): GateRunView {
    return {
      id: `gate-${Date.now()}`,
      projectId,
      status: 'passed',
      startedAt: new Date().toISOString()
    };
  }

  public requestReleaseReview(projectId: string): ReviewView[] {
    return [
      { id: `review-${Date.now()}-reviewer`, projectId, reviewer: 'reviewer', status: 'pending' },
      { id: `review-${Date.now()}-qa`, projectId, reviewer: 'qa', status: 'pending' }
    ];
  }

  public getSnapshot(): { runs: FoundryRunView[] } {
    return { runs: Object.values(this.runs) };
  }
}
