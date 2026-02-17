export interface WorkspaceRecord {
  id: string;
  tenantId: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlackboardEntryRecord {
  id: string;
  workspaceId: string;
  tenantId: string;
  entryType: string;
  entryKey: string;
  payload: unknown;
  version: number;
  createdBy: string;
  createdAt: string;
}

export interface WorkspaceSnapshotRecord {
  id: string;
  workspaceId: string;
  tenantId: string;
  createdBy: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface CoworkEventRecord {
  eventId: string;
  tenantId: string;
  aggregateId: string;
  aggregateType: string;
  type: string;
  payload: unknown;
  metadata: Record<string, unknown>;
  version: number;
  occurredAt: string;
  deliveredAt?: string;
}

export interface WorkflowInstanceRecord {
  workflowInstanceId: string;
  tenantId: string;
  workflowType: string;
  aggregateId: string;
  status: string;
  currentStep: string;
  state: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
