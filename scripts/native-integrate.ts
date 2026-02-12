#!/usr/bin/env ts-node
/**
 * OpenCode Tools Native Integration Script
 * 
 * This script runs during npm install to:
 * 1. Build the TypeScript project
 * 2. Register the CLI globally
 * 3. Integrate with OpenCode if available
 * 4. Set up system prompt
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
  success: (msg: string) => console.log(`[SUCCESS] ${msg}`)
};

interface IntegrationConfig {
  opancodeDir: string;
  systemPromptPath: string;
  cliPath: string;
}

function getOpenCodeDirectory(): string | null {
  // Try to find OpenCode installation
  const possiblePaths = [
    path.join(process.env.APPDATA || '', 'OpenCode'),
    path.join(process.env.HOME || '', '.opencode'),
    path.join(process.env.HOME || '', 'OpenCode'),
    '/usr/local/share/opencode',
    '/opt/opencode'
  ];

  for (const dir of possiblePaths) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }

  return null;
}

function integrateWithOpenCode(config: IntegrationConfig): void {
  logger.info('Checking for OpenCode installation...');
  
  const opencodeDir = getOpenCodeDirectory();
  if (!opencodeDir) {
    logger.info('OpenCode not found. CLI will be available as standalone tool.');
    return;
  }

  logger.success(`Found OpenCode at: ${opencodeDir}`);

  // Install system prompt
  const promptsDir = path.join(opencodeDir, 'prompts');
  if (!fs.existsSync(promptsDir)) {
    fs.mkdirSync(promptsDir, { recursive: true });
  }

  const systemPromptDest = path.join(promptsDir, 'opencode-tools-system.md');
  const systemPromptSrc = path.join(__dirname, '..', 'opencode-system-prompt.md');
  
  if (fs.existsSync(systemPromptSrc)) {
    fs.copyFileSync(systemPromptSrc, systemPromptDest);
    logger.success(`System prompt installed to: ${systemPromptDest}`);
  }

  // Register MCP server configuration
  const mcpConfigPath = path.join(opencodeDir, 'mcp.json');
  const mcpConfig = fs.existsSync(mcpConfigPath) 
    ? JSON.parse(fs.readFileSync(mcpConfigPath, 'utf-8'))
    : { servers: {} };

  mcpConfig.servers['opencode-tools'] = {
    name: 'OpenCode Tools',
    type: 'stdio',
    command: 'opencode-tools',
    args: ['mcp'],
    description: 'Complete developer team automation'
  };

  fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
  logger.success('MCP server configuration updated');
}

function setupGlobalCLI(): void {
  logger.info('Setting up global CLI...');
  
  const packageRoot = path.join(__dirname, '..');
  const cliPath = path.join(packageRoot, 'dist', 'cli.js');
  
  if (!fs.existsSync(cliPath)) {
    logger.error(`CLI not found at: ${cliPath}`);
    logger.info('Run "npm run build" first');
    return;
  }

  // Make CLI executable
  try {
    fs.chmodSync(cliPath, 0o755);
    logger.success('CLI permissions set');
  } catch (error) {
    logger.error(`Failed to set CLI permissions: ${error}`);
  }

  // Create symlink if needed (Unix systems)
  if (process.platform !== 'win32') {
    try {
      const globalBin = '/usr/local/bin';
      if (fs.existsSync(globalBin)) {
        const symlinkPath = path.join(globalBin, 'opencode-tools');
        if (!fs.existsSync(symlinkPath)) {
          fs.symlinkSync(cliPath, symlinkPath);
          logger.success(`Symlink created: ${symlinkPath} -> ${cliPath}`);
        }
      }
    } catch (error) {
      logger.info('Note: Could not create global symlink. Use "npm link" or install globally.');
    }
  }
}

/**
 * Register any bundled plugin manifests found under the repository's 'vantus_agents' directory into
 * the OpenCode installation (if available).
 */
function registerBundledPlugins(packageRoot: string, opencodeDir: string): void {
  try {
    const agentsDir = path.join(packageRoot, 'vantus_agents');
    if (!fs.existsSync(agentsDir)) return;

    const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
    const registered: string[] = [];

    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const manifestPath = path.join(agentsDir, e.name, 'manifest.json');
      if (!fs.existsSync(manifestPath)) continue;

      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        // Copy manifest into opencode's plugins directory
        const pluginsDir = path.join(opencodeDir, 'plugins');
        if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });

        const destPath = path.join(pluginsDir, `${manifest.id.replace(/[^a-z0-9_.-]/gi, '_')}.json`);
        fs.writeFileSync(destPath, JSON.stringify(manifest, null, 2));
        registered.push(manifest.id);
      } catch (err) {
        // ignore malformed manifest
      }
    }

    if (registered.length > 0) {
      console.log(`Registered bundled plugins in OpenCode: ${registered.join(', ')}`);
    }
  } catch (err) {
    // best-effort only
  }
}

function displayWelcomeMessage(): void {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              OpenCode Tools - Installation Complete           ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Available commands:                                          ║
║  • opencode-tools research <company>    - Research agent      ║
║  • opencode-tools docs <input>          - Documentation       ║
║  • opencode-tools architect <prd>       - Architecture        ║
║  • opencode-tools pdf <config>          - PDF generation      ║
║  • opencode-tools tui                   - Interactive TUI     ║
║  • opencode-tools orchestrate           - Full team mode      ║
║                                                               ║
║  Short alias: oct <command>                                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

function main(): void {
  logger.info('OpenCode Tools Native Integration');
  logger.info('=================================\n');

  try {
    // Setup global CLI
    setupGlobalCLI();

    // Integrate with OpenCode if available
    const config: IntegrationConfig = {
      opancodeDir: getOpenCodeDirectory() || '',
      systemPromptPath: '',
      cliPath: path.join(__dirname, '..', 'dist', 'cli.js')
    };
    integrateWithOpenCode(config);

    // Discover and register bundled plugin manifests under vantus_agents
    registerBundledPlugins(process.cwd(), config.opancodeDir || path.join(os.homedir(), '.opencode'));

    // Display welcome
    displayWelcomeMessage();

    logger.success('Integration complete!');
  } catch (error) {
    logger.error(`Integration failed: ${error}`);
    process.exit(1);
  }
}

// Run main if called directly
if (require.main === module) {
  main();
}

export { integrateWithOpenCode, setupGlobalCLI };
