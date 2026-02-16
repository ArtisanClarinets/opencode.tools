/**
 * Cowork Orchestrator
 * 
 * Multi-agent coordination with deterministic result merging.
 */

import { v4 as uuidv4 } from 'uuid';
import { CommandDefinition, AgentDefinition } from '../types';
import { CommandRegistry } from '../registries/command-registry';
import { AgentRegistry } from '../registries/agent-registry';
import { HookManager } from '../hooks/hook-manager';
import { ToolPermissionGate } from '../permissions/tool-gate';
import { AgentSpawner, SpawnOptions, TaskContext } from './agent-spawner';
import { ResultMerger, AgentResult, MergedResult } from './result-merger';

/**
 * Orchestrator options
 */
export interface OrchestratorOptions {
  /** Project directory */
  projectDir?: string;
  /** Directory for transcripts */
  transcriptDir?: string;
  /** Maximum concurrent agents */
  maxConcurrent?: number;
  /** Default timeout for agent execution */
  defaultTimeout?: number;
}

/**
 * Orchestrator context
 */
export interface OrchestratorContext {
  /** Command being executed */
  command: CommandDefinition;
  /** Command arguments */
  args: string[];
  /** Project directory */
  projectDir: string;
  /** Plugin root directory */
  pluginRoot: string;
}

/**
 * Transcript entry for logging
 */
export interface TranscriptEntry {
  /** Entry timestamp */
  timestamp: string;
  /** Entry type */
  type: 'spawn' | 'complete' | 'error' | 'merge';
  /** Agent ID if applicable */
  agentId?: string;
  /** Command ID if applicable */
  commandId?: string;
  /** Entry message */
  message: string;
  /** Additional data */
  data?: unknown;
}

/**
 * Cowork Orchestrator
 * Multi-agent coordination with deterministic result merging
 */
export class CoworkOrchestrator {
  private commandRegistry: CommandRegistry;
  private agentRegistry: AgentRegistry;
  private hookManager: HookManager;
  private permissionGate: ToolPermissionGate;
  private agentSpawner: AgentSpawner;
  private resultMerger: ResultMerger;
  private transcript: TranscriptEntry[];
  private options: OrchestratorOptions;

  /**
   * Create orchestrator
   * 
   * @param options - Orchestrator options
   */
  constructor(options?: OrchestratorOptions) {
    this.commandRegistry = CommandRegistry.getInstance();
    this.agentRegistry = AgentRegistry.getInstance();
    this.hookManager = new HookManager();
    this.permissionGate = new ToolPermissionGate();
    this.agentSpawner = new AgentSpawner();
    this.resultMerger = new ResultMerger();
    this.transcript = [];
    this.options = {
      projectDir: options?.projectDir || process.cwd(),
      transcriptDir: options?.transcriptDir,
      maxConcurrent: options?.maxConcurrent || 5,
      defaultTimeout: options?.defaultTimeout || 60000
    };
  }

  /**
   * Execute a command
   * 
   * @param commandId - Command ID to execute
   * @param args - Command arguments
   * @returns Merged result
   */
  public async execute(
    commandId: string,
    args?: string[]
  ): Promise<MergedResult> {
    const command = this.commandRegistry.get(commandId);

    if (!command) {
      return this.createErrorMergedResult(`Command "${commandId}" not found`);
    }

    const context: OrchestratorContext = {
      command,
      args: args || [],
      projectDir: this.options.projectDir || process.cwd(),
      pluginRoot: ''
    };

    return this.executeWithContext(commandId, context);
  }

  /**
   * Execute command with custom context
   * 
   * @param commandId - Command ID
   * @param context - Orchestrator context
   * @returns Merged result
   */
  public async executeWithContext(
    commandId: string,
    context: OrchestratorContext
  ): Promise<MergedResult> {
    const command = this.commandRegistry.get(commandId);

    if (!command) {
      return this.createErrorMergedResult(`Command "${commandId}" not found`);
    }

    this.addTranscriptEntry({
      type: 'spawn',
      commandId,
      message: `Starting execution of command "${command.name}"`,
      data: { args: context.args }
    });

    // Set up tool allowlist if specified in command
    if (command.allowedTools) {
      this.permissionGate.setCommandAllowlist(commandId, command.allowedTools);
    }

    // Parse command body for agent references
    const agentTasks = this.parseAgentReferences(command.body || '');

    let results: AgentResult[];

    if (agentTasks.length > 0) {
      // Execute agents
      results = await this.executeAgents(agentTasks, context);
    } else {
      // No agents to spawn - create a simple result
      results = [{
        agentId: 'command',
        agentName: command.name,
        output: {
          commandId,
          commandName: command.name,
          body: command.body,
          args: context.args
        },
        metadata: {
          runId: uuidv4(),
          timestamp: new Date().toISOString(),
          success: true
        }
      }];
    }

    // Merge results
    const mergedResult = this.resultMerger.merge(results);

    this.addTranscriptEntry({
      type: 'merge',
      commandId,
      message: `Command "${command.name}" completed`,
      data: { metadata: mergedResult.metadata }
    });

    return mergedResult;
  }

  /**
   * Spawn a subagent
   * 
   * @param agentId - Agent ID
   * @param task - Task prompt
   * @param context - Additional context
   * @returns Agent result
   */
  public async spawnAgent(
    agentId: string,
    task: string,
    context?: Record<string, unknown>
  ): Promise<AgentResult> {
    this.addTranscriptEntry({
      type: 'spawn',
      agentId,
      message: `Spawning agent "${agentId}"`
    });

    const taskContext: TaskContext = {
      task,
      context
    };

    const result = await this.agentSpawner.spawn(agentId, taskContext, {
      timeout: this.options.defaultTimeout
    });

    if (result.metadata.success) {
      this.addTranscriptEntry({
        type: 'complete',
        agentId,
        message: `Agent "${agentId}" completed successfully`
      });
    } else {
      this.addTranscriptEntry({
        type: 'error',
        agentId,
        message: `Agent "${agentId}" failed: ${result.metadata.error}`,
        data: { error: result.metadata.error }
      });
    }

    return result;
  }

  /**
   * Spawn multiple agents concurrently
   * 
   * @param tasks - Array of tasks
   * @returns Merged result
   */
  public async spawnAgents(
    tasks: Array<{
      agentId: string;
      task: string;
      context?: Record<string, unknown>;
    }>
  ): Promise<MergedResult> {
    this.addTranscriptEntry({
      type: 'spawn',
      message: `Spawning ${tasks.length} agents concurrently`
    });

    const taskContexts = tasks.map(t => ({
      agentId: t.agentId,
      context: {
        task: t.task,
        context: t.context
      }
    }));

    const results = await this.agentSpawner.spawnMany(
      taskContexts,
      { timeout: this.options.defaultTimeout }
    );

    const mergedResult = this.resultMerger.merge(results);

    this.addTranscriptEntry({
      type: 'merge',
      message: `Merged results from ${results.length} agents`,
      data: { metadata: mergedResult.metadata }
    });

    return mergedResult;
  }

  /**
   * Get execution transcript
   * 
   * @returns Array of transcript entries
   */
  public getTranscript(): TranscriptEntry[] {
    return [...this.transcript];
  }

  /**
   * Clear transcript
   */
  public clearTranscript(): void {
    this.transcript = [];
  }

  /**
   * Execute multiple agents
   */
  private async executeAgents(
    tasks: Array<{ agentId: string; task: string }>,
    context: OrchestratorContext
  ): Promise<AgentResult[]> {
    const maxConcurrent = this.options.maxConcurrent || 5;
    const results: AgentResult[] = [];

    // Process in batches to respect max concurrent limit
    for (let i = 0; i < tasks.length; i += maxConcurrent) {
      const batch = tasks.slice(i, i + maxConcurrent);
      
      const batchResults = await Promise.all(
        batch.map(async (task) => {
          return this.spawnAgent(task.agentId, task.task, {
            args: context.args,
            projectDir: context.projectDir,
            pluginRoot: context.pluginRoot
          });
        })
      );

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Parse agent references from command body
   * Looks for patterns like [[agent:agentId:task]]
   */
  private parseAgentReferences(body: string): Array<{ agentId: string; task: string }> {
    const tasks: Array<{ agentId: string; task: string }> = [];
    
    // Match patterns like [[agent:pm:Review code]]
    const regex = /\[\[agent:([^:]+):([^\]]+)\]\]/g;
    let match;
    
    while ((match = regex.exec(body)) !== null) {
      tasks.push({
        agentId: match[1],
        task: match[2]
      });
    }

    return tasks;
  }

  /**
   * Add entry to transcript
   */
  private addTranscriptEntry(entry: Omit<TranscriptEntry, 'timestamp'>): void {
    this.transcript.push({
      timestamp: new Date().toISOString(),
      ...entry
    });
  }

  /**
   * Create error merged result
   */
  private createErrorMergedResult(errorMessage: string): MergedResult {
    return {
      output: null,
      metadata: {
        agentIds: [],
        runIds: [],
        timestamp: new Date().toISOString(),
        totalToolsUsed: [],
        allSucceeded: false
      }
    };
  }
}
