import { FoundryState } from 'src/tui-foundry/store/store';

export const selectWorkspacesForProject = (state: FoundryState, projectId: string) =>
  state.workspaces.filter((workspace) => workspace.projectId === projectId);

export const selectActiveWorkspace = (state: FoundryState) =>
  state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId) ?? null;

export const selectWorkspaceArtifacts = (_state: FoundryState, _workspaceId: string) => [];

export const selectGateRunSummary = (state: FoundryState) => {
  const latest = state.qualityGateRuns[0];
  return latest ?? null;
};

export const selectAuditTimeline = (state: FoundryState) => state.eventTimeline;
