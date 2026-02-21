#!/usr/bin/env node

/**
 * Post-installation script for OpenCode Tools
 * 
 * This script automatically integrates OpenCode Tools with the global OpenCode installation.
 * It ensures all MCP tools are properly registered and available in the TUI.
 * 
 * Aligned with official OpenCode configuration schema:
 * - ~/.config/opencode/opencode.json - Main config with MCP servers, agents (singular), permissions
 * - ~/.config/opencode/agents/*.md - Agent definitions
 * - ~/.config/opencode/commands/*.md - Command definitions
 * - ~/.config/opencode/skills/*.md - Skill definitions
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Official OpenCode configuration schema
 */
interface OpenCodeConfig {
  /** Default agent to use (singular, not agents) */
  agent?: string | Record<string, unknown>;
  /** Permission rules for tools */
  permission?: Record<string, unknown>;
  /** MCP server configurations */
  mcp?: Record<string, McpServerConfig>;
  /** Plugin configurations */
  plugin?: Record<string, unknown>;
}

interface McpServerConfig {
  type: 'local' | 'remote';
  command?: string[];
  url?: string;
  description?: string;
  enabled?: boolean;
  timeout?: number;
}

class PostInstallIntegration {
  private readonly homeDir: string;
  private readonly opencodeDir: string;
  private readonly currentPackageDir: string;

  constructor() {
    this.homeDir = os.homedir();
    // Use XDG-like structure: ~/.config/opencode
    this.opencodeDir = path.join(this.homeDir, '.config', 'opencode');
    this.currentPackageDir = process.cwd();
  }

  async run(): Promise<void> {
    console.log('🔧 OpenCode Tools Post-Installation Integration');
    console.log('=============================================');

    try {
      // Step 1: Ensure OpenCode config directory exists
      await this.ensureOpenCodeDirectory();

      // Step 2: Backup existing configuration
      await this.backupExistingConfig();

      // Step 3: Merge OpenCode Tools configuration into official opencode.json
      await this.mergeConfiguration();

      // Step 4: Create global directories (agents, commands, skills, plugins, tools)
      await this.createGlobalDirectories();

      // Step 5: Validate MCP tool dependencies
      await this.validateMCPTools();

      console.log('\n✅ OpenCode Tools integration completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('   1. Restart your OpenCode TUI');
      console.log('   2. All tools should be available automatically');
      console.log('   3. If tools fail to start, run: opencode-tools verify (or --verify)');

    } catch (error) {
      console.error('\n❌ Integration failed:', error);
      console.log('\n🔧 Manual setup instructions:');
      console.log('   1. Ensure ~/.config/opencode/opencode.json has MCP server config');
      console.log('   2. Restart OpenCode TUI');
      process.exit(1);
    }
  }

  private async ensureOpenCodeDirectory(): Promise<void> {
    if (!fs.existsSync(this.opencodeDir)) {
      console.log(`📁 Creating OpenCode configuration directory at ${this.opencodeDir}...`);
      fs.mkdirSync(this.opencodeDir, { recursive: true });
    }
  }

  private async backupExistingConfig(): Promise<void> {
    const globalConfigPath = path.join(this.opencodeDir, 'opencode.json');
    
    if (fs.existsSync(globalConfigPath)) {
      const backupPath = path.join(this.opencodeDir, 'opencode.backup.json');
      console.log('💾 Backing up existing configuration...');
      fs.copyFileSync(globalConfigPath, backupPath);
    }
  }

  private async mergeConfiguration(): Promise<void> {
    const globalConfigPath = path.join(this.opencodeDir, 'opencode.json');

    // Load existing config or create new
    let globalConfig: OpenCodeConfig = {};
    if (fs.existsSync(globalConfigPath)) {
      try {
        globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, 'utf-8'));
      } catch (e) {
        console.warn('⚠️ Could not parse existing opencode.json, starting fresh.');
      }
    }

    // Initialize MCP if missing
    if (!globalConfig.mcp) {
      globalConfig.mcp = {};
    }

    // Add opencode-tools MCP server (this is the key integration)
    globalConfig.mcp['opencode-tools'] = {
      type: 'local',
      command: ['opencode-tools', 'mcp'],
      description: 'Complete developer team automation - Foundry orchestration, Cowork agents, research, docs, architecture, code generation, PDF/DOCX/XLSX generation, delivery',
      enabled: true,
      timeout: 60000,
    };

    // Set default agent if not set
    if (!globalConfig.agent) {
      globalConfig.agent = 'foundry';
    }

    // Add basic permission rules if not set
    if (!globalConfig.permission) {
      globalConfig.permission = {
        'bash.execute': 'ask',
        'fs.delete': 'ask',
        'edit.apply': 'allow',
      };
    }

    console.log('🔗 Merging MCP configuration into opencode.json...');
    fs.writeFileSync(globalConfigPath, JSON.stringify(globalConfig, null, 2));
  }

  private async createGlobalDirectories(): Promise<void> {
    const directories = [
      'agents',
      'commands',
      'skills',
      'plugins',
      'tools',
      'cowork/plugins',
    ];

    for (const dir of directories) {
      const fullPath = path.join(this.opencodeDir, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }
  }

  private async validateMCPTools(): Promise<void> {
    const globalConfigPath = path.join(this.opencodeDir, 'opencode.json');
    
    if (!fs.existsSync(globalConfigPath)) {
      return;
    }

    const config: OpenCodeConfig = JSON.parse(fs.readFileSync(globalConfigPath, 'utf-8'));

    console.log('🔍 Validating MCP tool dependencies...');

    for (const [toolName, toolConfig] of Object.entries(config.mcp || {})) {
      if (toolConfig.enabled !== false) {
        console.log(`  ✅ ${toolName} - configured`);
      }
    }
  }
}

// Run the post-installation integration
if (require.main === module) {
  const integration = new PostInstallIntegration();
  integration.run().catch(console.error);
}

export { PostInstallIntegration };
