/**
 * Agent Spawner for Cowork Orchestrator
 * 
 * Launches subagents with task context.
 */

import { v4 as uuidv4 } from 'uuid';
import { AgentRegistry } from '../registries/agent-registry';
import { ToolPermissionGate } from '../permissions/tool-gate';
import { AgentResult, ResultMerger } from './result-merger';

/**
 * Spawn options
 */
export interface SpawnOptions {
  /** Maximum execution time in ms */
  timeout?: number;
  /** Number of retries on failure */
  retries?: number;
}

/**
 * Task context for agent execution
 */
export interface TaskContext {
  /** Task/prompt for the agent */
  task: string;
  /** Additional context data */
  context?: Record<string, unknown>;
  /** Allowed tools for this task */
  tools?: string[];
}

/**
 * Custom agent handler function
 */
type AgentHandler = (context: TaskContext) => Promise<unknown>;

/**
 * Agent Spawner
 * Launches subagents with task context
 */
export class AgentSpawner {
  private agentRegistry: AgentRegistry;
  private permissionGate: ToolPermissionGate;
  private resultMerger: ResultMerger;
  private customHandlers: Map<string, AgentHandler>;

  /**
   * Create agent spawner
   */
  constructor() {
    this.agentRegistry = AgentRegistry.getInstance();
    this.permissionGate = new ToolPermissionGate();
    this.resultMerger = new ResultMerger();
    this.customHandlers = new Map<string, AgentHandler>();
  }

  /**
   * Spawn an agent with context
   * 
   * @param agentId - Agent ID to spawn
   * @param context - Task context
   * @param options - Spawn options
   * @returns Agent result
   */
  public async spawn(
    agentId: string,
    context: TaskContext,
    options?: SpawnOptions
  ): Promise<AgentResult> {
    const agent = this.agentRegistry.get(agentId);
    
    if (!agent) {
      return this.createErrorResult(agentId, `Agent "${agentId}" not found`);
    }

    // Set up tool allowlist if specified
    if (context.tools) {
      this.permissionGate.setAgentAllowlist(agentId, context.tools);
    }

    // Check tool permissions
    for (const tool of context.tools || []) {
      if (!this.permissionGate.checkToolAccess('agent', agentId, tool)) {
        return this.createErrorResult(agentId, `Tool "${tool}" not allowed for agent "${agentId}"`);
      }
    }

    // Execute with timeout
    const timeout = options?.timeout || 60000; // Default 60s
    const retries = options?.retries || 0;

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await this.executeWithTimeout(
          agent,
          context,
          timeout
        );
        
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < retries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    return this.createErrorResult(
      agentId, 
      lastError?.message || 'Agent execution failed'
    );
  }

  /**
   * Spawn multiple agents concurrently
   * 
   * @param tasks - Array of tasks with agent ID and context
   * @param options - Spawn options
   * @returns Array of agent results
   */
  public async spawnMany(
    tasks: Array<{ agentId: string; context: TaskContext }>,
    options?: SpawnOptions
  ): Promise<AgentResult[]> {
    // Spawn all agents in parallel
    const promises = tasks.map(task => 
      this.spawn(task.agentId, task.context, options)
    );

    return Promise.all(promises);
  }

  /**
   * Check if agent exists
   * 
   * @param agentId - Agent ID
   * @returns True if agent exists
   */
  public hasAgent(agentId: string): boolean {
    return this.agentRegistry.has(agentId);
  }

  /**
   * Register a custom agent handler
   * 
   * @param agentId - Agent ID
   * @param handler - Handler function
   */
  public registerAgentHandler(
    agentId: string,
    handler: AgentHandler
  ): void {
    this.customHandlers.set(agentId, handler);
  }

  /**
   * Execute agent with timeout
   */
  private async executeWithTimeout(
    agent: { id: string; name: string; body: string },
    context: TaskContext,
    timeout: number
  ): Promise<AgentResult> {
    return new Promise<AgentResult>((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(this.createErrorResult(agent.id, `Agent execution timed out after ${timeout}ms`));
      }, timeout);

      try {
        // Check for custom handler first
        const customHandler = this.customHandlers.get(agent.id);
        
        if (customHandler) {
          customHandler(context)
            .then(output => {
              clearTimeout(timeoutId);
              resolve(this.createSuccessResult(agent.id, agent.name, output));
            })
            .catch(error => {
              clearTimeout(timeoutId);
              resolve(this.createErrorResult(agent.id, error instanceof Error ? error.message : String(error)));
            });
          return;
        }

        // For now, we'll just simulate agent execution
        // In a real implementation, this would call the actual agent
        const output = {
          agentId: agent.id,
          agentName: agent.name,
          task: context.task,
          result: `Executed agent: ${agent.name}`
        };

        clearTimeout(timeoutId);
        resolve(this.createSuccessResult(agent.id, agent.name, output));
      } catch (error) {
        clearTimeout(timeoutId);
        resolve(this.createErrorResult(agent.id, error instanceof Error ? error.message : String(error)));
      }
    });
  }

  /**
   * Create a success result
   */
  private createSuccessResult(
    agentId: string,
    agentName: string,
    output: unknown
  ): AgentResult {
    return {
      agentId,
      agentName,
      output,
      metadata: {
        runId: uuidv4(),
        timestamp: new Date().toISOString(),
        success: true
      }
    };
  }

  /**
   * Create an error result
   */
  private createErrorResult(
    agentId: string,
    errorMessage: string
  ): AgentResult {
    return {
      agentId,
      agentName: agentId,
      output: null,
      metadata: {
        runId: uuidv4(),
        timestamp: new Date().toISOString(),
        success: false,
        error: errorMessage
      }
    };
  }
}
