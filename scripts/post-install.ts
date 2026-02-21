#!/usr/bin/env node

/**
 * Post-installation script for OpenCode Tools
 * 
 * This script automatically integrates OpenCode Tools with the global OpenCode installation.
 * It ensures all MCP tools are properly registered and available in the TUI.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface OpenCodeConfig {
  agents: Record<string, any>;
  tools: Record<string, boolean>;
  mcp: Record<string, any>;
  integrations?: Record<string, any>;
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

      // Step 3: Merge OpenCode Tools configuration
      await this.mergeConfiguration();

      // Step 4: Validate MCP tool dependencies
      await this.validateMCPTools();

      // Step 5: Create integration registry
      await this.createIntegrationRegistry();

      console.log('\n✅ OpenCode Tools integration completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('   1. Restart your OpenCode TUI');
      console.log('   2. All tools should be available automatically');
      console.log('   3. If tools fail to start, run: opencode-tools verify (or --verify)');

    } catch (error) {
      console.error('\n❌ Integration failed:', error);
      console.log('\n🔧 Manual setup instructions:');
      console.log('   1. Copy opencode.json to ~/.config/opencode/opencode.json');
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
    const toolsConfigPath = path.join(this.currentPackageDir, 'opencode.json');
    const globalConfigPath = path.join(this.opencodeDir, 'opencode.json');
    const toolsOutputConfigPath = path.join(this.opencodeDir, 'opencode-tools.json');

    if (!fs.existsSync(toolsConfigPath)) {
      throw new Error('opencode.json not found in package directory');
    }

    const toolsConfig: OpenCodeConfig = JSON.parse(fs.readFileSync(toolsConfigPath, 'utf-8'));

    // 1. Handle opencode-tools.json (agents, tools, integrations)
    let toolsGlobalConfig: Partial<OpenCodeConfig> = { agents: {}, tools: {}, integrations: {} };
    if (fs.existsSync(toolsOutputConfigPath)) {
      try {
        toolsGlobalConfig = JSON.parse(fs.readFileSync(toolsOutputConfigPath, 'utf-8'));
      } catch (e) {
        console.warn('⚠️ Could not parse existing opencode-tools.json, starting fresh.');
      }
    }

    const mergedToolsConfig = {
      agents: { ...toolsConfig.agents, ...(toolsGlobalConfig.agents || {}) },
      tools: { ...toolsConfig.tools, ...(toolsGlobalConfig.tools || {}) },
      integrations: {
        ...(toolsGlobalConfig.integrations || {}),
        'opencode-tools': {
          version: '1.0.0',
          installedAt: new Date().toISOString(),
          packagePath: this.currentPackageDir
        }
      }
    };

    console.log('🔗 Merging OpenCode Tools configuration into opencode-tools.json...');
    fs.writeFileSync(toolsOutputConfigPath, JSON.stringify(mergedToolsConfig, null, 2));

    // 2. Handle opencode.json (mcp only)
    let globalConfig: Record<string, any> = {};
    if (fs.existsSync(globalConfigPath)) {
      try {
        globalConfig = JSON.parse(fs.readFileSync(globalConfigPath, 'utf-8'));
      } catch (e) {
        console.warn('⚠️ Could not parse existing global config, starting fresh.');
      }
    }

    // Initialize mcp if missing
    if (!globalConfig.mcp) {
      globalConfig.mcp = {};
    }

    // Merge MCP config (global overrides default toolsConfig, but we merge keys)
    globalConfig.mcp = { ...toolsConfig.mcp, ...globalConfig.mcp };

    // CLEANUP: Remove agents, tools, integrations from opencode.json if present
    const keysToRemove = ['agents', 'tools', 'integrations'];
    let cleaned = false;
    for (const key of keysToRemove) {
      if (key in globalConfig) {
        delete globalConfig[key];
        cleaned = true;
      }
    }

    if (cleaned) {
      console.log('🧹 Cleaned up legacy configuration from opencode.json');
    }

    console.log('🔗 Merging MCP configuration into opencode.json...');
    fs.writeFileSync(globalConfigPath, JSON.stringify(globalConfig, null, 2));
  }

  private async validateMCPTools(): Promise<void> {
    const toolsConfigPath = path.join(this.currentPackageDir, 'opencode.json');
    const config = JSON.parse(fs.readFileSync(toolsConfigPath, 'utf-8'));

    console.log('🔍 Validating MCP tool dependencies...');

    for (const [toolName, toolConfig] of Object.entries(config.mcp || {})) {
      const config = toolConfig as any;
      if (config.enabled !== false) {
        const isValid = await this.testMCPTool(toolName, config);
        console.log(`  ${isValid ? '✅' : '❌'} ${toolName}`);
        
        if (!isValid) {
          console.warn(`    ⚠️  Tool ${toolName} may not function properly`);
        }
      }
    }
  }

  private async testMCPTool(toolName: string, toolConfig: any): Promise<boolean> {
    try {
      if (toolConfig.type === 'local') {
        // Test local command execution
        const command = toolConfig.command?.[0];
        if (command && command.startsWith('npx')) {
          // Test if npx can download the package
          const testCommand = `${command} --help`;
          const result = require('child_process').spawnSync(testCommand, { 
            shell: true, 
            timeout: 10000,
            stdio: 'pipe'
          });
          return result.status !== undefined && result.status !== 1;
        }
      }
      return true;
    } catch (error) {
      console.warn(`    Error testing ${toolName}:`, error);
      return false;
    }
  }

  private async createIntegrationRegistry(): Promise<void> {
    const registryPath = path.join(this.opencodeDir, 'integrations.json');
    
    const registry = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      integrations: {
        'opencode-tools': {
          name: 'OpenCode Tools',
          description: 'Automated client project research, documentation, and code generation',
          version: '1.0.0',
          agents: Object.keys(JSON.parse(
            fs.readFileSync(path.join(this.currentPackageDir, 'opencode.json'), 'utf-8')
          ).agents || {}),
          mcpTools: Object.keys(JSON.parse(
            fs.readFileSync(path.join(this.currentPackageDir, 'opencode.json'), 'utf-8')
          ).mcp || {}),
          tuiTools: [
            'research-agent',
            'architecture-agent', 
            'codegen-agent',
            'qa-agent',
            'delivery-agent',
            'documentation-agent'
          ]
        }
      }
    };

    console.log('📋 Creating integration registry...');
    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  }
}

// Run the post-installation integration
if (require.main === module) {
  const integration = new PostInstallIntegration();
  integration.run().catch(console.error);
}

export { PostInstallIntegration };
