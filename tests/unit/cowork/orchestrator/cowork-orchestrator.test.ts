/**
 * Tests for Cowork Orchestrator
 */

import { CoworkOrchestrator } from '../../../../src/cowork/orchestrator/cowork-orchestrator';
import { CommandRegistry } from '../../../../src/cowork/registries/command-registry';
import { AgentRegistry } from '../../../../src/cowork/registries/agent-registry';
import { CommandDefinition, AgentDefinition } from '../../../../src/cowork/types';

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123')
}));

describe('CoworkOrchestrator', () => {
  let orchestrator: CoworkOrchestrator;
  let commandRegistry: CommandRegistry;
  let agentRegistry: AgentRegistry;

  beforeEach(() => {
    orchestrator = new CoworkOrchestrator();
    commandRegistry = CommandRegistry.getInstance();
    agentRegistry = AgentRegistry.getInstance();
    commandRegistry.clear();
    agentRegistry.clear();
    orchestrator.clearTranscript();
  });

  describe('execute', () => {
    it('should return error for non-existing command', async () => {
      const result = await orchestrator.execute('non-existing');

      expect(result.metadata.allSucceeded).toBe(false);
    });

    it('should execute existing command', async () => {
      const command: CommandDefinition = {
        id: 'test-command',
        name: 'Test Command',
        description: 'A test command',
        body: 'This is a test command body'
      };
      commandRegistry.register(command);

      const result = await orchestrator.execute('test-command');

      expect(result.metadata.agentIds).toContain('command');
      expect(result.metadata.allSucceeded).toBe(true);
    });
  });

  describe('executeWithContext', () => {
    it('should execute with custom context', async () => {
      const command: CommandDefinition = {
        id: 'test-command',
        name: 'Test Command',
        description: 'A test command',
        body: 'Command body'
      };
      commandRegistry.register(command);

      const result = await orchestrator.executeWithContext('test-command', {
        command,
        args: ['arg1', 'arg2'],
        projectDir: '/test/project',
        pluginRoot: '/test/plugins'
      });

      expect(result.metadata.allSucceeded).toBe(true);
    });
  });

  describe('spawnAgent', () => {
    it('should return error for non-existing agent', async () => {
      const result = await orchestrator.spawnAgent('non-existing', 'test task');

      expect(result.metadata.success).toBe(false);
    });

    it('should spawn existing agent', async () => {
      const agent: AgentDefinition = {
        id: 'pm',
        name: 'Project Manager',
        description: 'PM agent',
        body: 'You are a project manager.'
      };
      agentRegistry.register(agent);

      const result = await orchestrator.spawnAgent('pm', 'Plan a project');

      expect(result.agentId).toBe('pm');
      expect(result.metadata.success).toBe(true);
    });
  });

  describe('spawnAgents', () => {
    it('should spawn multiple agents', async () => {
      const pm: AgentDefinition = {
        id: 'pm',
        name: 'Project Manager',
        description: 'PM agent',
        body: 'You are a project manager.'
      };
      const architect: AgentDefinition = {
        id: 'architect',
        name: 'Architect',
        description: 'Architect agent',
        body: 'You are an architect.'
      };
      agentRegistry.register(pm);
      agentRegistry.register(architect);

      const result = await orchestrator.spawnAgents([
        { agentId: 'pm', task: 'Plan' },
        { agentId: 'architect', task: 'Design' }
      ]);

      expect(result.metadata.agentIds).toHaveLength(2);
      expect(result.metadata.allSucceeded).toBe(true);
    });
  });

  describe('transcript', () => {
    it('should record transcript entries', async () => {
      const command: CommandDefinition = {
        id: 'test-command',
        name: 'Test Command',
        description: 'A test command',
        body: 'Command body'
      };
      commandRegistry.register(command);

      await orchestrator.execute('test-command');

      const transcript = orchestrator.getTranscript();

      expect(transcript.length).toBeGreaterThan(0);
    });

    it('should clear transcript', async () => {
      const command: CommandDefinition = {
        id: 'test-command',
        name: 'Test Command',
        description: 'A test command',
        body: 'Command body'
      };
      commandRegistry.register(command);

      await orchestrator.execute('test-command');
      orchestrator.clearTranscript();

      expect(orchestrator.getTranscript()).toEqual([]);
    });
  });
});
