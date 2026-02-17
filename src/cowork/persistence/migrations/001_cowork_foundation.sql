CREATE SCHEMA IF NOT EXISTS cowork;

CREATE TABLE IF NOT EXISTS cowork.workspaces (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workspaces_tenant ON cowork.workspaces(tenant_id);

CREATE TABLE IF NOT EXISTS cowork.blackboard_entries (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES cowork.workspaces(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  entry_type TEXT NOT NULL,
  entry_key TEXT NOT NULL,
  payload JSONB NOT NULL,
  version INT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_blackboard_version ON cowork.blackboard_entries(workspace_id, entry_key, version);
CREATE INDEX IF NOT EXISTS idx_blackboard_tenant_workspace ON cowork.blackboard_entries(tenant_id, workspace_id);

CREATE TABLE IF NOT EXISTS cowork.workspace_snapshots (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES cowork.workspaces(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS cowork.domain_events (
  event_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  aggregate_type TEXT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  metadata JSONB NOT NULL,
  version INT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_domain_events_aggregate ON cowork.domain_events(tenant_id, aggregate_id, version);
CREATE INDEX IF NOT EXISTS idx_domain_events_type ON cowork.domain_events(type);
CREATE INDEX IF NOT EXISTS idx_domain_events_delivery ON cowork.domain_events(delivered_at);

CREATE TABLE IF NOT EXISTS cowork.workflow_instances (
  workflow_instance_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  workflow_type TEXT NOT NULL,
  aggregate_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_step TEXT NOT NULL,
  state JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS cowork.workflow_history (
  id TEXT PRIMARY KEY,
  workflow_instance_id TEXT NOT NULL REFERENCES cowork.workflow_instances(workflow_instance_id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  from_step TEXT,
  to_step TEXT,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
