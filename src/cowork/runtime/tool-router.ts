import { ToolPermissionGate } from '../permissions/tool-gate';
import { logger } from '../../runtime/logger';
import * as path from 'path';

/**
 * Tool Definition
 */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: any; // JSON schema
  handler: (args: any) => Promise<any>;
}

/**
 * Tool Router
 * Executes tools and checks permissions
 */
export class ToolRouter {
  private tools: Map<string, ToolDefinition>;
  private permissionGate: ToolPermissionGate;

  constructor() {
    this.tools = new Map<string, ToolDefinition>();
    this.permissionGate = new ToolPermissionGate();

    // Register some basic tools
    this.register({
        name: 'fs.list',
        description: 'List files in a directory',
        parameters: { type: 'object', properties: { path: { type: 'string' } } },
        handler: async ({ path: inputPath }) => {
            const fs = require('fs');
            const safePath = path.resolve(process.cwd(), inputPath || '.');
            if (!safePath.startsWith(process.cwd())) {
                throw new Error('Access denied: Path outside project directory');
            }
            return fs.readdirSync(safePath);
        }
    });

     this.register({
        name: 'fs.read',
        description: 'Read a file',
        parameters: { type: 'object', properties: { path: { type: 'string' } } },
        handler: async ({ path: inputPath }) => {
            const fs = require('fs');
            const safePath = path.resolve(process.cwd(), inputPath);
            if (!safePath.startsWith(process.cwd())) {
                throw new Error('Access denied: Path outside project directory');
            }
            return fs.readFileSync(safePath, 'utf8');
        }
    });
  }

  /**
   * Register a tool
   */
  public register(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  /**
   * Execute a tool
   */
  public async execute(agentId: string, toolName: string, args: any): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool "${toolName}" not found`);
    }

    // Check permissions
    if (!this.permissionGate.checkToolAccess('agent', agentId, toolName)) {
      throw new Error(`Agent "${agentId}" does not have permission to execute "${toolName}"`);
    }

    logger.info(`Agent ${agentId} executing ${toolName}`, args);
    try {
      const result = await tool.handler(args);
      return result;
    } catch (error: any) {
      logger.error(`Tool execution failed: ${error.message}`, { toolName, args });
      throw error;
    }
  }

  /**
   * Get tool definitions for LLM
   */
  public getDefinitions(): any[] {
    return Array.from(this.tools.values()).map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }));
  }

  /**
   * Set allowlist for an agent
   */
  public setAllowlist(agentId: string, allowedTools: string[]) {
      this.permissionGate.setAgentAllowlist(agentId, allowedTools);
  }
}
