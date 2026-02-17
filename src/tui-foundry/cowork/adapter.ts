import { CoworkOrchestrator } from 'src/cowork/orchestrator/cowork-orchestrator';
import {
  ConflictRecord,
  ProjectWorkspace,
  WorkspaceSnapshotRecord
} from 'src/tui-foundry/types';

export class CoworkAdapter {
  private orchestrator: CoworkOrchestrator | null = null;
  private workspaces: ProjectWorkspace[] = [];
  private snapshotsByWorkspace: Record<string, WorkspaceSnapshotRecord[]> = {};
  private conflictsByWorkspace: Record<string, ConflictRecord[]> = {};
  private activeWorkspaceId: string | null = null;

  public async initialize(orchestrator: CoworkOrchestrator): Promise<void> {
    this.orchestrator = orchestrator;
  }

  public getOrchestrator(): CoworkOrchestrator {
    if (!this.orchestrator) {
      this.orchestrator = CoworkOrchestrator.getInstance();
    }

    return this.orchestrator;
  }

  public listWorkspaces(): ProjectWorkspace[] {
    return [...this.workspaces];
  }

  public createWorkspace(projectId: string, name: string, members: string[]): ProjectWorkspace {
    const workspace: ProjectWorkspace = {
      id: `${projectId}-${Date.now()}`,
      projectId,
      name,
      members,
      status: 'active',
      lastActivityAt: new Date().toISOString()
    };
    this.workspaces = [workspace, ...this.workspaces];
    this.activeWorkspaceId = workspace.id;
    return workspace;
  }

  public setActiveWorkspace(workspaceId: string): void {
    this.activeWorkspaceId = workspaceId;
  }

  public getActiveWorkspaceId(): string | null {
    return this.activeWorkspaceId;
  }

  public async listCheckpoints(workspaceId: string): Promise<WorkspaceSnapshotRecord[]> {
    return [...(this.snapshotsByWorkspace[workspaceId] ?? [])];
  }

  public async createCheckpoint(
    workspaceId: string,
    createdBy: string,
    metadata?: Record<string, unknown>
  ): Promise<WorkspaceSnapshotRecord | null> {
    const workspace = this.workspaces.find((entry) => entry.id === workspaceId);
    if (!workspace) {
      return null;
    }

    const snapshot: WorkspaceSnapshotRecord = {
      id: `${workspaceId}-checkpoint-${Date.now()}`,
      workspaceId,
      createdBy,
      createdAt: new Date().toISOString(),
      metadata
    };

    const records = this.snapshotsByWorkspace[workspaceId] ?? [];
    this.snapshotsByWorkspace[workspaceId] = [snapshot, ...records];
    return snapshot;
  }

  public getWorkspaceConflicts(workspaceId: string): ConflictRecord[] {
    return [...(this.conflictsByWorkspace[workspaceId] ?? [])];
  }

  public resolveConflict(conflictId: string): boolean {
    const workspaceId = Object.keys(this.conflictsByWorkspace).find((candidate) =>
      (this.conflictsByWorkspace[candidate] ?? []).some((conflict) => conflict.id === conflictId)
    );

    if (!workspaceId) {
      return false;
    }

    this.conflictsByWorkspace[workspaceId] = (this.conflictsByWorkspace[workspaceId] ?? []).map((conflict) =>
      conflict.id === conflictId ? { ...conflict, status: 'resolved' } : conflict
    );

    return true;
  }
}

export const coworkAdapter = new CoworkAdapter();
