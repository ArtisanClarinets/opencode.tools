import { ToolPermissionGate } from '../permissions/tool-gate';
import { logger } from '../../runtime/logger';
import * as path from 'path';
import * as fs from 'fs';

export interface ToolRouterOptions {
  fsBasePath?: string;
}

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
  private fsBasePath?: string;

  constructor(options?: ToolRouterOptions) {
    this.tools = new Map<string, ToolDefinition>();
    this.permissionGate = new ToolPermissionGate();
    const configuredBasePath = options?.fsBasePath ?? process.env.COWORK_FS_BASE_PATH;
    this.fsBasePath = configuredBasePath ? path.resolve(configuredBasePath) : undefined;

    // Register some basic tools
    this.register({
        name: 'fs.list',
        description: 'List files in a directory',
        parameters: { type: 'object', properties: { path: { type: 'string' } } },
        handler: async ({ path: inputPath }) => {
            const normPath = this.resolveFsPath(inputPath, '.');
            return fs.readdirSync(normPath);
        }
    });

     this.register({
        name: 'fs.read',
        description: 'Read a file',
        parameters: { type: 'object', properties: { path: { type: 'string' } } },
        handler: async ({ path: inputPath }) => {
            const fullPath = this.resolveFsPath(inputPath);
            return fs.readFileSync(fullPath, 'utf8');
        }
    });
  }

  private resolveFsPath(inputPath: unknown, defaultPath?: string): string {
    if (!this.fsBasePath) {
      throw new Error('Filesystem tools are disabled: COWORK_FS_BASE_PATH is not configured.');
    }

    const rawPath = (inputPath === undefined || inputPath === null || inputPath === '')
      ? defaultPath
      : inputPath;

    if (typeof rawPath !== 'string' || rawPath.trim() === '') {
      throw new Error('Invalid path: expected a non-empty string path.');
    }

    if (rawPath.includes('\0')) {
      throw new Error('Invalid path: null-byte is not allowed.');
    }

    const resolvedPath = path.resolve(this.fsBasePath, rawPath);
    const relative = path.relative(this.fsBasePath, resolvedPath);
    const escapesBase = relative.startsWith('..') || path.isAbsolute(relative);

    if (escapesBase) {
      throw new Error(`Invalid path: "${rawPath}" escapes configured filesystem boundary.`);
    }

    return resolvedPath;
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
