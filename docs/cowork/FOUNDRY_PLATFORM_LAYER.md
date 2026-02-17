# Cowork Foundry Platform Layer

Foundry is the durable Cowork platform layer: PostgreSQL-backed collaboration persistence, persistent eventing, and workflow orchestration.

## Architecture Notes

### Persistence Boundaries
- **CollaborativeWorkspace** persists workspace lifecycle and checkpoint metadata through `PostgresPersistenceManager`.
- **Blackboard** persists artifact writes with optimistic versioning (`workspace_id + entry_key + version` uniqueness).
- Configuration is centralized in `CoworkConfigManager`:
  - `COWORK_DATABASE_URL`
  - `COWORK_DB_SCHEMA`
  - `COWORK_RUN_MIGRATIONS`
  - `COWORK_DB_POOL_MAX`
  - `COWORK_TENANT_ID`

### Event Bus Model
- Domain events are appended to `domain_events` (append-only).
- Delivery semantics are **at-least-once**; consumer handlers must be idempotent.
- `EventBus.replayUndeliveredEvents()` enables restart recovery.

### Workflow Foundation (Phase 1)
- `WorkflowEngine` supports:
  - register workflow definitions
  - start workflow instances
  - advance instances via events
  - persist instance + transition history
- Included starter workflows:
  - `workspace-provisioning`
  - `blackboard-review-publish`

## Migrations

Migrations are in `src/cowork/persistence/migrations` and are applied by `PostgresPersistenceManager.initialize()` when `runMigrations=true`.

Rollback strategy: forward-only migrations; apply a new migration to undo/alter previous behavior.

## Running Integration Tests

> Requires Docker and PostgreSQL container image availability.

Enable Docker-backed tests:

```bash
COWORK_RUN_DOCKER_TESTS=1 npm test -- tests/integration/cowork/persistence.integration.test.ts
```

The test harness starts a disposable Postgres container and validates:
- fresh migration application
- workspace + blackboard persistence round-trip
- version-conflict/concurrency behavior
- event persistence + workflow progression
