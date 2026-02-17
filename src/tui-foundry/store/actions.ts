import {
  ConflictRecord,
  EvidenceView,
  FoundryRunView,
  GateRunView,
  ProjectWorkspace,
  ReviewView,
  TimelineEventView,
  WorkspaceSnapshotRecord
} from 'src/tui-foundry/types';

export type FoundryAction =
  | { type: 'SCREEN_SET_ACTIVE'; screen: import('src/tui-foundry/types').FoundryScreen }
  | { type: 'WORKSPACES_SET_ALL'; workspaces: ProjectWorkspace[] }
  | { type: 'WORKSPACE_SET_ACTIVE'; workspaceId: string | null }
  | { type: 'WORKSPACE_SNAPSHOTS_SET'; workspaceId: string; snapshots: WorkspaceSnapshotRecord[] }
  | { type: 'WORKSPACE_CONFLICTS_SET'; workspaceId: string; conflicts: ConflictRecord[] }
  | { type: 'FOUNDRY_RUN_STARTED'; run: FoundryRunView }
  | { type: 'FOUNDRY_RUN_UPDATED'; run: FoundryRunView }
  | { type: 'FOUNDRY_RUN_FINISHED'; runId: string }
  | { type: 'FOUNDRY_RUN_ABORTED'; runId: string }
  | { type: 'GATES_RUN_STARTED'; run: GateRunView }
  | { type: 'GATES_RUN_FINISHED'; run: GateRunView }
  | { type: 'RELEASE_REVIEW_SET'; review: ReviewView }
  | { type: 'AUDIT_TIMELINE_APPEND'; event: TimelineEventView }
  | { type: 'EVIDENCE_APPEND'; entry: EvidenceView };
