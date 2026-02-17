import { v4 as uuidv4 } from 'uuid';
import { CoworkConfigManager } from 'src/cowork/config/cowork-config-manager';
import { CollaborativeWorkspace } from 'src/cowork/collaboration/collaborative-workspace';
import { Blackboard } from 'src/cowork/orchestrator/blackboard';
import { EventBus } from 'src/cowork/orchestrator/event-bus';
import { PostgresPersistenceManager } from 'src/cowork/persistence/postgres-persistence-manager';
import {
  BLACKBOARD_REVIEW_WORKFLOW,
  WORKSPACE_PROVISIONING_WORKFLOW,
  WorkflowEngine
} from 'src/cowork/workflow/workflow-engine';
import { hasDocker, startPostgresHarness } from './postgres-harness';

describe('Cowork Postgres integration', () => {
  const shouldRun = hasDocker() && !!process.env.COWORK_RUN_DOCKER_TESTS;
  const describeOrSkip = shouldRun ? describe : describe.skip;

  describeOrSkip('with real postgres container', () => {
    let harness: ReturnType<typeof startPostgresHarness> | null = null;
    let persistenceManager: PostgresPersistenceManager;

    beforeAll(async () => {
      harness = startPostgresHarness('integration');
      CoworkConfigManager.resetForTests();
      const schema = `cowork_it_${Date.now()}`;
      const config = CoworkConfigManager.getInstance({
        connectionString: harness.connectionString,
        schema,
        runMigrations: true,
        poolMax: 4,
        tenantId: 'tenant-alpha'
      });
      persistenceManager = new PostgresPersistenceManager(config);
      await persistenceManager.initialize();
    });

    afterAll(async () => {
      await persistenceManager.close();
      harness?.stop();
    });

    it('applies migrations and supports workspace + blackboard roundtrip', async () => {
      const workspace = new CollaborativeWorkspace(persistenceManager);
      await workspace.initialize();

      const created = await workspace.createWorkspace('Acme Workspace');
      await workspace.openWorkspace(created.id);

      const board = Blackboard.getInstance();
      board.updateArtifact('prd', { title: 'PRD v1' }, 'pm', 'document');

      await new Promise((resolve) => setTimeout(resolve, 250));

      const persisted = await persistenceManager.listLatestBlackboardEntries(created.id, 'tenant-alpha');
      expect(persisted).toHaveLength(1);
      expect(persisted[0].entryKey).toBe('prd');
    });

    it('supports basic concurrency conflict via unique version guard', async () => {
      const workspace = await persistenceManager.getWorkspaceById(
        (await new CollaborativeWorkspace(persistenceManager).createWorkspace('Concurrency')).id,
        'tenant-alpha'
      );
      expect(workspace).not.toBeNull();
      const workspaceId = workspace!.id;

      const entryId1 = uuidv4();
      const entryId2 = uuidv4();
      const createdAt = new Date().toISOString();

      await persistenceManager.upsertBlackboardEntry({
        id: entryId1,
        workspaceId,
        tenantId: 'tenant-alpha',
        entryType: 'doc',
        entryKey: 'shared-key',
        payload: { version: 1 },
        version: 1,
        createdBy: 'agent-a',
        createdAt
      });

      await expect(
        persistenceManager.upsertBlackboardEntry({
          id: entryId2,
          workspaceId,
          tenantId: 'tenant-alpha',
          entryType: 'doc',
          entryKey: 'shared-key',
          payload: { version: 'duplicate' },
          version: 1,
          createdBy: 'agent-b',
          createdAt
        })
      ).rejects.toThrow();
    });

    it('persists events and advances workflow instances from replayable stream', async () => {
      const eventBus = EventBus.getInstance();
      await eventBus.configurePersistence(persistenceManager);

      const workflowEngine = new WorkflowEngine(eventBus, persistenceManager);
      workflowEngine.registerDefinition(WORKSPACE_PROVISIONING_WORKFLOW);
      workflowEngine.registerDefinition(BLACKBOARD_REVIEW_WORKFLOW);
      await workflowEngine.initialize();

      const workspace = new CollaborativeWorkspace(persistenceManager);
      await workspace.initialize();
      const created = await workspace.createWorkspace('Workflow Workspace');

      const replayed = await eventBus.replayUndeliveredEvents();
      expect(replayed).toBeGreaterThanOrEqual(0);

      const started = await workflowEngine.startWorkflow('workspace-provisioning', created.id, { owner: 'pm' });
      const advanced = await workflowEngine.advanceWorkflow(started.workflowInstanceId, 'workspace:hydrated', {
        hydratedBy: 'system'
      });

      expect(advanced?.currentStep).toBe('ready');
    });
  });
});
