#!/usr/bin/env ts-node
/**
 * OpenCode Tools Native Integration Script
 * 
 * This script runs during npm install to:
 * 1. Build the TypeScript project
 * 2. Register the CLI globally
 * 3. Integrate with OpenCode if available
 * 4. Set up system prompt
 * 
 * IMPORTANT: OpenCode uses ~/.config/opencode/ as its config directory (XDG standard)
 * and configures MCP servers in opencode.json under the "mcp" key.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
  success: (msg: string) => console.log(`[SUCCESS] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`)
};

interface IntegrationConfig {
  opencodeConfigDir: string;
  systemPromptPath: string;
  cliPath: string;
}

function getOpenCodeConfigDirectory(): string {
  // Use XDG_CONFIG_HOME standard: ~/.config/opencode/
  const xdgConfig = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
  return path.join(xdgConfig, 'opencode');
}

function getOpenCodeDirectory(): string | null {
  // Check for OpenCode installation in standard locations
  const configDir = getOpenCodeConfigDirectory();
  if (fs.existsSync(configDir)) {
    return configDir;
  }
  
  // Fallback: check legacy locations
  const legacyPaths = [
    path.join(process.env.APPDATA || '', 'OpenCode'),
    path.join(os.homedir(), '.opencode'),
    path.join(os.homedir(), 'OpenCode'),
    '/usr/local/share/opencode',
    '/opt/opencode'
  ];

  for (const dir of legacyPaths) {
    if (fs.existsSync(dir)) {
      // Migrate to XDG standard location if using legacy path
      logger.info(`Found legacy OpenCode at: ${dir}`);
      logger.info(`Migrating to XDG standard: ${configDir}`);
      return dir;
    }
  }

  return null;
}

function integrateWithOpenCode(config: IntegrationConfig): void {
  logger.info('Checking for OpenCode installation...');
  
  const opencodeDir = getOpenCodeDirectory() || getOpenCodeConfigDirectory();
  
  // Ensure config directory exists
  if (!fs.existsSync(opencodeDir)) {
    fs.mkdirSync(opencodeDir, { recursive: true });
    logger.info(`Created OpenCode config directory: ${opencodeDir}`);
  }
  
  logger.success(`Using OpenCode config at: ${opencodeDir}`);

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
  } else {
    logger.info('System prompt source not found, skipping');
  }

  // Register MCP server configuration in opencode.json
  // OpenCode uses "mcp" key for MCP server configuration
  const opencodeConfigPath = path.join(opencodeDir, 'opencode.json');
  let opencodeConfig: any = {};
  
  // First, try to copy the full configuration from the package
  const packageOpencodeJson = path.join(__dirname, '..', 'opencode.json');
  if (fs.existsSync(packageOpencodeJson)) {
    try {
      const packageConfig = JSON.parse(fs.readFileSync(packageOpencodeJson, 'utf-8'));
      
      // Merge with existing config - existing config takes precedence
      // but we add missing MCP servers from package
      opencodeConfig = { ...opencodeConfig, ...packageConfig };
      
      // Ensure MCP servers from package are included (but don't override user settings)
      if (packageConfig.mcp) {
        for (const [serverName, serverConfig] of Object.entries(packageConfig.mcp)) {
          if (!opencodeConfig.mcp[serverName]) {
            opencodeConfig.mcp[serverName] = serverConfig;
          }
        }
      }
      
      // Set default_agent from package if not set
      if (!opencodeConfig.default_agent && packageConfig.default_agent) {
        opencodeConfig.default_agent = packageConfig.default_agent;
      }
      
      logger.info('Loaded and merged opencode.json configuration from package');
    } catch (e) {
      logger.warn('Could not parse package opencode.json, using minimal config');
    }
  } else if (fs.existsSync(opencodeConfigPath)) {
    try {
      opencodeConfig = JSON.parse(fs.readFileSync(opencodeConfigPath, 'utf-8'));
    } catch (e) {
      logger.warn('Could not parse existing opencode.json, creating new config');
      opencodeConfig = {};
    }
  }

  // Ensure mcp key exists
  if (!opencodeConfig.mcp) {
    opencodeConfig.mcp = {};
  }

  // Add our MCP server configuration with full access
  // Use "opencodeTools" (camelCase) to avoid hyphen issues
  // This ensures the opencode-tools-mcp is available in global installation
  opencodeConfig.mcp['opencodeTools'] = {
    type: 'local',
    command: ['opencode-tools', 'mcp'],
    description: 'Complete developer team automation - research, docs, architecture, code generation, document creation (PDF, DOCX, XLSX, PPTX, CSV), delivery',
    enabled: true,
    timeout: 30000
  };

  // Set default_agent if not set (use default_agent for official schema)
  if (!opencodeConfig.default_agent) {
    opencodeConfig.default_agent = 'foundry';
  }

  // Add other recommended MCP servers
  opencodeConfig.mcp['SequentialThinking'] = {
    type: 'local',
    command: ['npx', '-y', '@modelcontextprotocol/server-sequential-thinking'],
    enabled: true,
    timeout: 10000
  };
  
  opencodeConfig.mcp['Memory'] = {
    type: 'local',
    command: ['npx', '-y', '@modelcontextprotocol/server-memory@latest'],
    enabled: true,
    timeout: 5000
  };
  
  opencodeConfig.mcp['critical-thinking'] = {
    type: 'local',
    command: ['npx', '-y', 'mcp-server-actor-critic-thinking'],
    enabled: true,
    timeout: 15000
  };

  fs.writeFileSync(opencodeConfigPath, JSON.stringify(opencodeConfig, null, 2));
  logger.success('Full MCP server configuration added to opencode.json');
  
  // Also create a tools.json for complete tool access (using underscores for MCP compliance)
  const toolsConfigPath = path.join(opencodeDir, 'opencode-tools.json');
  const toolsConfig = {
    version: "1.0.0",
    description: "OpenCode Tools - Complete Developer Team Automation",
    tools: [
      "webfetch", "search", "search_with_retry", "search_for_facts",
      "rate_limit", "source_normalize",
      "audit_log", "audit_replay", "audit_check_reproducibility",
      "research_plan", "research_gather", "research_extract_claims", "research_analyze_citations", "research_peer_review", "research_finalize",
      "discovery_start_session", "discovery_export_session", "discovery_detect_stack",
      "docs_generate_prd", "docs_generate_sow",
      "arch_generate", "backlog_generate",
      "codegen_scaffold", "codegen_feature", "codegen_tests",
      "qa_generate_testplan", "qa_generate_risk_matrix", "qa_static_analysis", "qa_generate_tests", "qa_peer_review",
      "proposal_generate", "proposal_peer_review", "proposal_export",
      "delivery_generate_runbook", "delivery_generate_nginx", "delivery_smoketest", "delivery_handoff",
      "documents_docx", "documents_xlsx", "documents_pptx", "documents_csv", "documents_md",
      "ci_verify"
    ],
    agents: [
      "foundry", "orchestrator", "architecture", "codegen", "database",
      "proposal", "qa", "delivery", "research", "security", "pdf", "summarization"
    ]
  };
  
  fs.writeFileSync(toolsConfigPath, JSON.stringify(toolsConfig, null, 2));
  logger.success('Tools configuration saved to opencode-tools.json');
  
  // Copy optional devteam.ts template if it exists
  const packageRoot = path.join(__dirname, '..');
  const devteamTemplateSrc = path.join(packageRoot, 'templates', 'opencode', 'tools', 'devteam.ts');
  const devteamTemplateDest = path.join(opencodeDir, 'tools', 'devteam.ts');
  
  if (fs.existsSync(devteamTemplateSrc)) {
    try {
      if (!fs.existsSync(path.dirname(devteamTemplateDest))) {
        fs.mkdirSync(path.dirname(devteamTemplateDest), { recursive: true });
      }
      if (!fs.existsSync(devteamTemplateDest)) {
        fs.copyFileSync(devteamTemplateSrc, devteamTemplateDest);
        logger.success('Copied devteam.ts template to tools directory');
      }
    } catch (e) {
      logger.warn('Could not copy devteam.ts template');
    }
  }
   
  // Also copy CLI entry point to make it accessible
  const binDir = path.join(opencodeDir, 'bin');
  if (!fs.existsSync(binDir)) {
    fs.mkdirSync(binDir, { recursive: true });
  }
}

function setupGlobalCLI(): void {
  logger.info('Setting up global CLI...');
  
  const packageRoot = path.join(__dirname, '..');
  const cliPath = path.join(packageRoot, 'dist', 'src', 'cli.js');
  
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
          // If a file already exists at the symlink path, don't try to link it
          // Let npm handle the global installation via bin field in package.json
          logger.info('Skipping manual symlink, let npm handle global bin linkage.');
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
        // NOTE: OpenCode plugins dir is ~/.config/opencode/plugins/
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
║  • opencode-tools mcp                   - Run MCP server     ║
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
    const configDir = getOpenCodeDirectory() || getOpenCodeConfigDirectory();
    
    // Determine correct CLI path - works both from source (ts-node) and dist
    const isCompiled = __filename.endsWith('.js');
    const cliPath = isCompiled
      ? path.join(__dirname, '..', 'src', 'cli.js')  // From dist/scripts/
      : path.join(__dirname, '..', 'dist', 'src', 'cli.js');  // From scripts/
    
    const config: IntegrationConfig = {
      opencodeConfigDir: configDir,
      systemPromptPath: '',
      cliPath
    };
    integrateWithOpenCode(config);

    // Discover and register bundled plugin manifests under vantus_agents
    // Use XDG standard location
    const configHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
    const standardOpencodeDir = path.join(configHome, 'opencode');
    registerBundledPlugins(process.cwd(), standardOpencodeDir);

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

export { integrateWithOpenCode, setupGlobalCLI, getOpenCodeConfigDirectory };
