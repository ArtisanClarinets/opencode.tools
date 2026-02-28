import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { TOOL_DEFS } from '../tools/mcp/registry';

async function main() {
  const cliPath = path.resolve(__dirname, '..', 'dist', 'src', 'cli.js');
  if (!fs.existsSync(cliPath)) {
    console.error('CLI not found. Please run `npm run build` first.');
    process.exit(1);
  }

  const server = spawn('node', [cliPath, 'mcp']);
  let buffer = '';

  server.stdout.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.trim()) {
        handleResponse(JSON.parse(line));
      }
    }
  });

  server.stderr.on('data', (data) => {
    console.error(`MCP Server stderr: ${data}`);
  });

  server.on('close', (code) => {
    console.log(`MCP Server exited with code ${code}`);
  });

  await sendRequest(server, 'initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'verify', version: '1.0' } });
  server.stdin?.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  await sendRequest(server, 'tools/list', {});
  await sendRequest(server, 'tools/call', { name: 'foundry_health', arguments: {} });

  setTimeout(() => {
    server.kill();
  }, 5000);
}

async function sendRequest(server: ChildProcess, method: string, params: any) {
  const request = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params
  };
  if (server.stdin) {
    server.stdin.write(JSON.stringify(request) + '\n');
  }
}

function handleResponse(response: any) {
  console.log('Received response:', JSON.stringify(response, null, 2));
  if (response.error) {
    console.error('MCP Server error:', response.error);
    process.exit(1);
  }

  if (response.result?.tools) {
    const receivedTools = response.result.tools.map((t: any) => t.name);
    const expectedTools = TOOL_DEFS.map(t => t.name);
    const missingTools = expectedTools.filter(t => !receivedTools.includes(t));
    if (missingTools.length > 0) {
      console.error('Missing tools:', missingTools);
      process.exit(1);
    }
    console.log('All tools are listed.');
  }
}

main().catch(console.error);