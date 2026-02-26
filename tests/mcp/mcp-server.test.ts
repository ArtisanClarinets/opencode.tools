import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { TOOL_DEFS } from '../../tools/mcp/registry';

describe('MCP Server', () => {
  let server: ChildProcess;
  let responses: any[] = [];

  beforeAll((done) => {
    const cliPath = path.resolve(__dirname, '..', '..', 'dist', 'src', 'cli.js');
    if (!fs.existsSync(cliPath)) {
      throw new Error('CLI not found. Please run `npm run build` first.');
    }

    server = spawn('node', [cliPath, 'mcp']);
    let buffer = '';

    server.stdout.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.trim()) {
          responses.push(JSON.parse(line));
        }
      }
    });

    server.stderr.on('data', (data) => {
      console.error(`MCP Server stderr: ${data}`);
    });

    // Wait for the server to be ready
    setTimeout(() => {
      done();
    }, 2000);
  });

  afterAll(() => {
    server.kill();
  });

  test('should respond to initialize request', async () => {
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2025-06-18' }
    };
    server.stdin.write(JSON.stringify(request) + '\n');

    await new Promise(resolve => setTimeout(resolve, 500));

    const response = responses.find(r => r.id === 1);
    expect(response).toBeDefined();
    expect(response.result.serverInfo.name).toBe('opencode-tools-mcp');
  });

  test('should respond to tools/list request with all tools', async () => {
    const request = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    };
    server.stdin.write(JSON.stringify(request) + '\n');

    await new Promise(resolve => setTimeout(resolve, 500));

    const response = responses.find(r => r.id === 2);
    expect(response).toBeDefined();
    const receivedTools = response.result.tools.map((t: any) => t.name);
    const expectedTools = TOOL_DEFS.map(t => t.name);
    expect(receivedTools).toEqual(expect.arrayContaining(expectedTools));
  });
});
