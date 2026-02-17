import * as React from 'react';
import { FoundryScreen } from 'src/tui-foundry/types';
import { FoundryAction } from 'src/tui-foundry/store/actions';
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

export interface FoundryState {
  activeScreen: FoundryScreen;
  workspaces: ProjectWorkspace[];
  activeWorkspaceId: string | null;
  workspaceSnapshotsById: Record<string, WorkspaceSnapshotRecord[]>;
  workspaceConflictsById: Record<string, ConflictRecord[]>;
  foundryRuns: Record<string, FoundryRunView>;
  activeRunId: string | null;
  qualityGateRuns: GateRunView[];
  releaseReviews: ReviewView[];
  eventTimeline: TimelineEventView[];
  evidenceEntries: EvidenceView[];
}

const initialState: FoundryState = {
  activeScreen: 'dashboard',
  workspaces: [],
  activeWorkspaceId: null,
  workspaceSnapshotsById: {},
  workspaceConflictsById: {},
  foundryRuns: {},
  activeRunId: null,
  qualityGateRuns: [],
  releaseReviews: [],
  eventTimeline: [],
  evidenceEntries: []
};

function reducer(state: FoundryState, action: FoundryAction): FoundryState {
  switch (action.type) {
    case 'SCREEN_SET_ACTIVE':
      return { ...state, activeScreen: action.screen };
    case 'WORKSPACES_SET_ALL':
      return { ...state, workspaces: action.workspaces };
    case 'WORKSPACE_SET_ACTIVE':
      return { ...state, activeWorkspaceId: action.workspaceId };
    case 'WORKSPACE_SNAPSHOTS_SET':
      return {
        ...state,
        workspaceSnapshotsById: {
          ...state.workspaceSnapshotsById,
          [action.workspaceId]: action.snapshots
        }
      };
    case 'WORKSPACE_CONFLICTS_SET':
      return {
        ...state,
        workspaceConflictsById: {
          ...state.workspaceConflictsById,
          [action.workspaceId]: action.conflicts
        }
      };
    case 'FOUNDRY_RUN_STARTED':
    case 'FOUNDRY_RUN_UPDATED':
      return {
        ...state,
        activeRunId: action.run.runId,
        foundryRuns: {
          ...state.foundryRuns,
          [action.run.runId]: action.run
        }
      };
    case 'FOUNDRY_RUN_FINISHED':
    case 'FOUNDRY_RUN_ABORTED': {
      const run = state.foundryRuns[action.runId];
      if (!run) {
        return state;
      }
      const status = action.type === 'FOUNDRY_RUN_ABORTED' ? 'aborted' : 'completed';
      return {
        ...state,
        foundryRuns: {
          ...state.foundryRuns,
          [action.runId]: { ...run, status, updatedAt: new Date().toISOString() }
        }
      };
    }
    case 'GATES_RUN_STARTED':
      return { ...state, qualityGateRuns: [action.run, ...state.qualityGateRuns] };
    case 'GATES_RUN_FINISHED':
      return {
        ...state,
        qualityGateRuns: state.qualityGateRuns.map((gateRun) =>
          gateRun.id === action.run.id ? action.run : gateRun
        )
      };
    case 'RELEASE_REVIEW_SET':
      return { ...state, releaseReviews: [action.review, ...state.releaseReviews] };
    case 'AUDIT_TIMELINE_APPEND':
      return { ...state, eventTimeline: [action.event, ...state.eventTimeline].slice(0, 500) };
    case 'EVIDENCE_APPEND':
      return { ...state, evidenceEntries: [action.entry, ...state.evidenceEntries].slice(0, 500) };
    default:
      return state;
  }
}

const StoreContext = React.createContext<{
  state: FoundryState;
  dispatch: React.Dispatch<FoundryAction>;
  setScreen: (screen: FoundryScreen) => void;
} | null>(null);

export const FoundryStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const setScreen = React.useCallback((screen: FoundryScreen) => {
    dispatch({ type: 'SCREEN_SET_ACTIVE', screen });
  }, [dispatch]);

  return <StoreContext.Provider value={{ state, dispatch, setScreen }}>{children}</StoreContext.Provider>;
};

export const useFoundryStore = () => {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error('useFoundryStore must be used inside FoundryStoreProvider');
  }

  return context;
};

export { reducer as foundryReducer, initialState as foundryInitialState };
