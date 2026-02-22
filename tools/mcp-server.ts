import { foundryOrchestrate } from './foundry';

export interface CtoSweepInput {
  request: string; // short intent or request body
  repoRoot?: string;
  maxIterations?: number;
  runQualityGates?: boolean;
}

/**
 * Gateway MCP tool to run a CTO sweep end-to-end
 */
export async function cto_sweep(input: CtoSweepInput): Promise<unknown> {
  const repo = input.repoRoot || process.cwd();
  const report = await foundryOrchestrate({
    projectName: input.request.slice(0, 80),
    description: input.request,
    repoRoot: repo,
    maxIterations: input.maxIterations,
    runQualityGates: input.runQualityGates,
  });

  return report;
}

/**
 * MCP Server main entry point
 * 
 * Starts the MCP server using stdio transport for local execution.
 * This function is called by the CLI when running `opencode-tools mcp`.
 * 
 * Implements a minimal MCP server without the broken SDK dependency.
 */
export async function main(): Promise<void> {
  // Import all available tools
  const { 
    cto_sweep,
    foundryOrchestrate,
    foundryStatus, 
    foundryHealth,
    coworkList,
    coworkRun,
    coworkSpawn,
    coworkHealth: coworkHealthCheck,
    coworkPlugins,
    coworkAgents,
  } = await import('./index');
  
  // Create tool definitions for MCP
  const tools = [
    {
      name: 'cto_sweep',
      description: 'Run a CTO sweep - complete enterprise development workflow with research, architecture, implementation, QA, and security',
      inputSchema: {
        type: 'object',
        properties: {
          request: { type: 'string', description: 'Project request or intent description' },
          repoRoot: { type: 'string', description: 'Repository root directory (optional, defaults to cwd)' },
          maxIterations: { type: 'number', description: 'Maximum iteration count (optional, defaults to 2)' },
          runQualityGates: { type: 'boolean', description: 'Whether to run quality gates (optional, defaults to true)' },
        },
        required: ['request'],
      },
    },
    {
      name: 'foundry_status',
      description: 'Get Foundry orchestration status and health',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Optional project ID to check status for' },
        },
      },
    },
    {
      name: 'foundry_health',
      description: 'Check Foundry system health',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'cowork_list',
      description: 'List available cowork commands, agents, and plugins',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['commands', 'agents', 'plugins'], description: 'Type to list' },
        },
      },
    },
    {
      name: 'cowork_run',
      description: 'Run a cowork command',
      inputSchema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Command name to execute' },
          args: { type: 'array', items: { type: 'string' }, description: 'Command arguments' },
        },
        required: ['command'],
      },
    },
    {
      name: 'cowork_spawn',
      description: 'Spawn a cowork agent directly',
      inputSchema: {
        type: 'object',
        properties: {
          agentId: { type: 'string', description: 'Agent ID to spawn' },
          task: { type: 'string', description: 'Task/prompt for the agent' },
        },
        required: ['agentId', 'task'],
      },
    },
  ];

  // Simple JSON-RPC over stdio implementation
  const stdin = process.stdin;
  const stdout = process.stdout;
  
  let requestId = 0;
  
  // Read line by line from stdin
  let buffer = '';
  
  stdin.setEncoding('utf8');
  
  stdin.on('data', async (chunk: string) => {
    buffer += chunk;
    
    // Try to parse complete JSON lines
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      try {
        const request = JSON.parse(line);
        
        // Handle JSON-RPC requests
        if (request.jsonrpc === '2.0' && request.method) {
          const response = await handleMethod(request.method, request.params, request.id);
          
          if (response) {
            stdout.write(JSON.stringify(response) + '\n');
          } else if (request.id) {
            // Error response
            stdout.write(JSON.stringify({
              jsonrpc: '2.0',
              id: request.id,
              error: { code: -32601, message: 'Method not found' }
            }) + '\n');
          }
        } else if (request.method === 'tools/list') {
          // Handle tools/list
          const response = {
            jsonrpc: '2.0',
            id: request.id || ++requestId,
            result: { tools }
          };
          stdout.write(JSON.stringify(response) + '\n');
        } else if (request.method === 'tools/call') {
          // Handle tools/call
          const response = await handleToolCall(request.params, request.id || ++requestId);
          stdout.write(JSON.stringify(response) + '\n');
        }
      } catch (e) {
        // Ignore parse errors for incomplete lines
      }
    }
  });
  
  async function handleMethod(method: string, params: unknown, id: number) {
    if (method === 'tools/list') {
      return { jsonrpc: '2.0', id, result: { tools } };
    }
    return null;
  }
  
  async function handleToolCall(params: { name: string; arguments: Record<string, unknown> }, id: number) {
    const { name, arguments: args } = params;
    
    try {
      let result: unknown;
      
      switch (name) {
        case 'cto_sweep':
          result = await cto_sweep(args as unknown as CtoSweepInput);
          break;
        case 'foundry_status':
          result = await foundryStatus(args as unknown as { projectId?: string });
          break;
        case 'foundry_health':
          result = await foundryHealth({});
          break;
        case 'cowork_list':
          result = await coworkList(args as unknown as { type?: 'commands' | 'agents' | 'plugins' });
          break;
        case 'cowork_run':
          result = await coworkRun({
            commandId: (args as unknown as { command: string }).command,
            args: (args as unknown as { args?: string[] }).args,
          });
          break;
        case 'cowork_spawn':
          result = await coworkSpawn(args as unknown as { agentId: string; task: string });
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
      
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        },
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32000,
          message: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}

export default { cto_sweep, main };
