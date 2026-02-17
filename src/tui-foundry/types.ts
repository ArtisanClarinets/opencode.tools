export type FoundryScreen =
  | 'dashboard'
  | 'project'
  | 'agentHub'
  | 'execution'
  | 'chat'
  | 'workspaces'
  | 'workspace'
  | 'audit'
  | 'settings';

export const SCREEN_ORDER: FoundryScreen[] = [
  'dashboard',
  'project',
  'agentHub',
  'execution',
  'chat',
  'workspaces',
  'workspace',
  'audit',
  'settings'
];

export const SCREEN_LABELS: Record<FoundryScreen, string> = {
  dashboard: 'Dashboard',
  project: 'Project',
  agentHub: 'Agent Hub',
  execution: 'Execution',
  chat: 'Chat',
  workspaces: 'Workspaces',
  workspace: 'Workspace Detail',
  audit: 'Audit & Evidence',
  settings: 'Settings'
};

export const SCREEN_SHORTCUTS: Partial<Record<FoundryScreen, string>> = {
  dashboard: '1',
  project: '2',
  agentHub: '3',
  execution: '4',
  chat: '5',
  workspaces: '6',
  workspace: '7',
  audit: '8',
  settings: '9'
};

export interface ProjectWorkspace {
  id: string;
  projectId: string;
  name: string;
  members: string[];
  status: 'active' | 'idle';
  lastActivityAt: string;
}

export interface WorkspaceSnapshotRecord {
  id: string;
  workspaceId: string;
  createdAt: string;
  createdBy: string;
  metadata?: Record<string, unknown>;
}

export interface ConflictRecord {
  id: string;
  workspaceId: string;
  summary: string;
  status: 'open' | 'resolved';
}

export interface FoundryRunView {
  runId: string;
  projectId: string;
  status: 'running' | 'paused' | 'aborted' | 'completed';
  objective: string;
  updatedAt: string;
}

export interface GateRunView {
  id: string;
  projectId: string;
  status: 'passed' | 'failed';
  startedAt: string;
}

export interface ReviewView {
  id: string;
  projectId: string;
  reviewer: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface TimelineEventView {
  id: string;
  category: string;
  message: string;
  timestamp: string;
}

export interface EvidenceView {
  id: string;
  title: string;
  category: string;
  createdAt: string;
}
