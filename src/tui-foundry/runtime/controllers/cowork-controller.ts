import { coworkAdapter, CoworkAdapter } from 'src/tui-foundry/cowork/adapter';
import {
  ConflictRecord,
  ProjectWorkspace,
  WorkspaceSnapshotRecord
} from 'src/tui-foundry/types';

export class CoworkController {
  constructor(private readonly adapter: CoworkAdapter = coworkAdapter) {}

  public listWorkspaces(): ProjectWorkspace[] {
    return this.adapter.listWorkspaces();
  }

  public setActiveWorkspace(workspaceId: string): void {
    this.adapter.setActiveWorkspace(workspaceId);
  }

  public createWorkspace(projectId: string, name: string, members: string[]): ProjectWorkspace {
    return this.adapter.createWorkspace(projectId, name, members);
  }

  public async createCheckpoint(
    workspaceId: string,
    createdBy: string,
    metadata?: Record<string, unknown>
  ): Promise<WorkspaceSnapshotRecord | null> {
    return this.adapter.createCheckpoint(workspaceId, createdBy, metadata);
  }

  public async listCheckpoints(workspaceId: string): Promise<WorkspaceSnapshotRecord[]> {
    return this.adapter.listCheckpoints(workspaceId);
  }

  public getConflicts(workspaceId: string): ConflictRecord[] {
    return this.adapter.getWorkspaceConflicts(workspaceId);
  }

  public resolveConflict(conflictId: string): boolean {
    return this.adapter.resolveConflict(conflictId);
  }

  public async spawnAgent(agentId: string, task: string, workspaceId: string): Promise<unknown> {
    return this.adapter.getOrchestrator().spawnAgent(agentId, task, { workspaceId });
  }

  public async requestReview(fromAgentId: string, toAgentId: string, artifactKey: string): Promise<unknown> {
    return this.adapter.getOrchestrator().spawnAgent(toAgentId, `Review artifact ${artifactKey}`, { fromAgentId });
  }
}
