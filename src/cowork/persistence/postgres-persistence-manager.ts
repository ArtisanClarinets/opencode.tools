import * as fs from 'fs';
import * as path from 'path';
import { CoworkConfigManager } from 'src/cowork/config/cowork-config-manager';
import {
  BlackboardEntryRecord,
  CoworkEventRecord,
  WorkflowInstanceRecord,
  WorkspaceRecord,
  WorkspaceSnapshotRecord
} from 'src/cowork/persistence/types';

interface QueryResultRow {
  [key: string]: unknown;
}

interface QueryResult {
  rows: QueryResultRow[];
  rowCount?: number;
}

interface QueryClient {
  query(sql: string, params?: unknown[]): Promise<QueryResult>;
  release(): void;
}

interface QueryPool {
  query(sql: string, params?: unknown[]): Promise<QueryResult>;
  connect(): Promise<QueryClient>;
  end(): Promise<void>;
}

function loadPool(connectionString: string, max: number): QueryPool {
  const pgModule = require('pg') as { Pool: new (options: { connectionString: string; max: number }) => QueryPool };
  return new pgModule.Pool({ connectionString, max });
}

export class PostgresPersistenceManager {
  private readonly pool: QueryPool;
  private initialized = false;

  constructor(private readonly configManager: CoworkConfigManager = CoworkConfigManager.getInstance()) {
    const config = this.configManager.getPersistenceConfig();
    this.pool = loadPool(config.connectionString, config.poolMax);
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const config = this.configManager.getPersistenceConfig();
    if (config.runMigrations) {
      await this.runMigrations();
    }

    this.initialized = true;
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }

  public async withTransaction<T>(callback: (client: QueryClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async createWorkspace(record: WorkspaceRecord): Promise<void> {
    const schema = this.getSchema();
    await this.pool.query(
      `INSERT INTO ${schema}.workspaces (id, tenant_id, name, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [record.id, record.tenantId, record.name, record.status, record.createdAt, record.updatedAt]
    );
  }

  public async getWorkspaceById(workspaceId: string, tenantId: string): Promise<WorkspaceRecord | null> {
    const schema = this.getSchema();
    const result = await this.pool.query(
      `SELECT id, tenant_id, name, status, created_at, updated_at
       FROM ${schema}.workspaces WHERE id = $1 AND tenant_id = $2`,
      [workspaceId, tenantId]
    );

    if (!result.rows[0]) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: String(row.id),
      tenantId: String(row.tenant_id),
      name: String(row.name),
      status: String(row.status),
      createdAt: new Date(String(row.created_at)).toISOString(),
      updatedAt: new Date(String(row.updated_at)).toISOString()
    };
  }

  public async upsertBlackboardEntry(record: BlackboardEntryRecord): Promise<void> {
    const schema = this.getSchema();
    await this.pool.query(
      `INSERT INTO ${schema}.blackboard_entries
       (id, workspace_id, tenant_id, entry_type, entry_key, payload, version, created_by, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        record.id,
        record.workspaceId,
        record.tenantId,
        record.entryType,
        record.entryKey,
        JSON.stringify(record.payload),
        record.version,
        record.createdBy,
        record.createdAt
      ]
    );
  }

  public async listLatestBlackboardEntries(workspaceId: string, tenantId: string): Promise<BlackboardEntryRecord[]> {
    const schema = this.getSchema();
    const result = await this.pool.query(
      `SELECT DISTINCT ON (entry_key)
        id, workspace_id, tenant_id, entry_type, entry_key, payload, version, created_by, created_at
       FROM ${schema}.blackboard_entries
       WHERE workspace_id = $1 AND tenant_id = $2
       ORDER BY entry_key, version DESC`,
      [workspaceId, tenantId]
    );

    return result.rows.map((row) => ({
      id: String(row.id),
      workspaceId: String(row.workspace_id),
      tenantId: String(row.tenant_id),
      entryType: String(row.entry_type),
      entryKey: String(row.entry_key),
      payload: row.payload,
      version: Number(row.version),
      createdBy: String(row.created_by),
      createdAt: new Date(String(row.created_at)).toISOString()
    }));
  }

  public async getNextEntryVersion(workspaceId: string, entryKey: string, tenantId: string): Promise<number> {
    const schema = this.getSchema();
    const result = await this.pool.query(
      `SELECT COALESCE(MAX(version), 0) AS current_version
       FROM ${schema}.blackboard_entries
       WHERE workspace_id = $1 AND entry_key = $2 AND tenant_id = $3`,
      [workspaceId, entryKey, tenantId]
    );
    return Number(result.rows[0].current_version) + 1;
  }

  public async createWorkspaceSnapshot(record: WorkspaceSnapshotRecord): Promise<void> {
    const schema = this.getSchema();
    await this.pool.query(
      `INSERT INTO ${schema}.workspace_snapshots (id, workspace_id, tenant_id, created_by, metadata, created_at)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [record.id, record.workspaceId, record.tenantId, record.createdBy, JSON.stringify(record.metadata), record.createdAt]
    );
  }

  public async appendEvent(record: CoworkEventRecord): Promise<void> {
    const schema = this.getSchema();
    await this.pool.query(
      `INSERT INTO ${schema}.domain_events
       (event_id, tenant_id, aggregate_id, aggregate_type, type, payload, metadata, version, occurred_at, delivered_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        record.eventId,
        record.tenantId,
        record.aggregateId,
        record.aggregateType,
        record.type,
        JSON.stringify(record.payload),
        JSON.stringify(record.metadata),
        record.version,
        record.occurredAt,
        record.deliveredAt || null
      ]
    );
  }

  public async listUndeliveredEvents(limit = 100): Promise<CoworkEventRecord[]> {
    const schema = this.getSchema();
    const result = await this.pool.query(
      `SELECT event_id, tenant_id, aggregate_id, aggregate_type, type, payload, metadata, version, occurred_at, delivered_at
       FROM ${schema}.domain_events
       WHERE delivered_at IS NULL
       ORDER BY occurred_at ASC
       LIMIT $1`,
      [limit]
    );

    return result.rows.map((row) => ({
      eventId: String(row.event_id),
      tenantId: String(row.tenant_id),
      aggregateId: String(row.aggregate_id),
      aggregateType: String(row.aggregate_type),
      type: String(row.type),
      payload: row.payload,
      metadata: (row.metadata as Record<string, unknown>) || {},
      version: Number(row.version),
      occurredAt: new Date(String(row.occurred_at)).toISOString(),
      deliveredAt: row.delivered_at ? new Date(String(row.delivered_at)).toISOString() : undefined
    }));
  }

  public async markEventDelivered(eventId: string): Promise<void> {
    const schema = this.getSchema();
    await this.pool.query(`UPDATE ${schema}.domain_events SET delivered_at = NOW() WHERE event_id = $1`, [eventId]);
  }

  public async upsertWorkflowInstance(record: WorkflowInstanceRecord): Promise<void> {
    const schema = this.getSchema();
    await this.pool.query(
      `INSERT INTO ${schema}.workflow_instances
       (workflow_instance_id, tenant_id, workflow_type, aggregate_id, status, current_step, state, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (workflow_instance_id)
       DO UPDATE SET status = EXCLUDED.status, current_step = EXCLUDED.current_step, state = EXCLUDED.state, updated_at = EXCLUDED.updated_at`,
      [
        record.workflowInstanceId,
        record.tenantId,
        record.workflowType,
        record.aggregateId,
        record.status,
        record.currentStep,
        JSON.stringify(record.state),
        record.createdAt,
        record.updatedAt
      ]
    );
  }

  public async getWorkflowInstance(workflowInstanceId: string, tenantId: string): Promise<WorkflowInstanceRecord | null> {
    const schema = this.getSchema();
    const result = await this.pool.query(
      `SELECT workflow_instance_id, tenant_id, workflow_type, aggregate_id, status, current_step, state, created_at, updated_at
       FROM ${schema}.workflow_instances
       WHERE workflow_instance_id = $1 AND tenant_id = $2`,
      [workflowInstanceId, tenantId]
    );

    const row = result.rows[0];
    if (!row) {
      return null;
    }

    return {
      workflowInstanceId: String(row.workflow_instance_id),
      tenantId: String(row.tenant_id),
      workflowType: String(row.workflow_type),
      aggregateId: String(row.aggregate_id),
      status: String(row.status),
      currentStep: String(row.current_step),
      state: (row.state as Record<string, unknown>) || {},
      createdAt: new Date(String(row.created_at)).toISOString(),
      updatedAt: new Date(String(row.updated_at)).toISOString()
    };
  }

  public async appendWorkflowHistory(entry: {
    id: string;
    workflowInstanceId: string;
    tenantId: string;
    eventType: string;
    fromStep: string | null;
    toStep: string | null;
    payload: Record<string, unknown>;
    createdAt: string;
  }): Promise<void> {
    const schema = this.getSchema();
    await this.pool.query(
      `INSERT INTO ${schema}.workflow_history
      (id, workflow_instance_id, tenant_id, event_type, from_step, to_step, payload, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        entry.id,
        entry.workflowInstanceId,
        entry.tenantId,
        entry.eventType,
        entry.fromStep,
        entry.toStep,
        JSON.stringify(entry.payload),
        entry.createdAt
      ]
    );
  }

  public async runMigrations(): Promise<void> {
    const config = this.configManager.getPersistenceConfig();
    const client = await this.pool.connect();

    try {
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${config.schema}`);
      await client.query(
        `CREATE TABLE IF NOT EXISTS ${config.schema}.schema_migrations (
          version TEXT PRIMARY KEY,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )`
      );

      const migrationDir = path.join(process.cwd(), 'src/cowork/persistence/migrations');
      const migrationFiles = fs.readdirSync(migrationDir).filter((file) => file.endsWith('.sql')).sort();

      for (const fileName of migrationFiles) {
        const version = fileName.replace('.sql', '');
        const applied = await client.query(
          `SELECT version FROM ${config.schema}.schema_migrations WHERE version = $1`,
          [version]
        );
        if (applied.rowCount && applied.rowCount > 0) {
          continue;
        }

        const content = fs.readFileSync(path.join(migrationDir, fileName), 'utf8');
        const sql = content.replace(/cowork\./g, `${config.schema}.`);
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(`INSERT INTO ${config.schema}.schema_migrations (version) VALUES ($1)`, [version]);
        await client.query('COMMIT');
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private getSchema(): string {
    return this.configManager.getPersistenceConfig().schema;
  }
}
