import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { TOOL_DEFS } from '../tools/mcp/registry';

const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
  success: (msg: string) => console.log(`[SUCCESS] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`)
};

function getOpenCodeConfigDirectory(): string {
  const xdgConfig = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(xdgConfig, 'opencode');
}

function integrateWithOpenCode(): void {
  logger.info('Integrating with OpenCode...');
  
  const opencodeDir = getOpenCodeConfigDirectory();
  if (!fs.existsSync(opencodeDir)) {
    fs.mkdirSync(opencodeDir, { recursive: true });
  }

  const toolsConfigPath = path.join(opencodeDir, 'opencode-tools.json');
  const toolsConfig = {
    version: "1.0.0",
    description: "OpenCode Tools - Complete Developer Team Automation",
    tools: TOOL_DEFS.map(t => t.name),
    agents: [
      "foundry", "orchestrator", "architecture", "codegen", "database",
      "proposal", "qa", "delivery", "research", "security", "pdf", "summarization"
    ]
  };
  
  fs.writeFileSync(toolsConfigPath, JSON.stringify(toolsConfig, null, 2));
  logger.success('Tools configuration saved to opencode-tools.json');
}

if (require.main === module) {
  integrateWithOpenCode();
}