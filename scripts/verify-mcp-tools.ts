#!/usr/bin/env node

/**
 * MCP Tools Verification Script
 * 
 * This script validates that all MCP tools in opencode.json are properly configured
 * and can start successfully. It provides detailed diagnostics for troubleshooting.
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';

interface MCPTool {
  type: 'local' | 'remote';
  command?: string[];
  url?: string;
  enabled: boolean;
  timeout?: number;
  environment?: Record<string, string>;
}

interface OpenCodeConfig {
  mcp: Record<string, MCPTool>;
}

class MCPVerifier {
  private config: OpenCodeConfig;
  private results: Map<string, ToolTestResult> = new Map();

  constructor(private configPath: string = 'opencode.json') {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Configuration file not found: ${configPath}`);
    }
    
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }

  async verifyAll(): Promise<void> {
    console.log('🔍 MCP Tools Verification Report');
    console.log('==============================\n');

    const tools = Object.entries(this.config.mcp || {});
    
    if (tools.length === 0) {
      console.log('⚠️  No MCP tools configured in opencode.json');
      return;
    }

    console.log(`Testing ${tools.length} MCP tools...\n`);

    for (const [toolName, toolConfig] of tools) {
      console.log(`Testing ${toolName}...`);
      const result = await this.testTool(toolName, toolConfig);
      this.results.set(toolName, result);
      
      this.printResult(toolName, result);
      console.log(''); // Empty line for readability
    }

    this.printSummary();
  }

  private async testTool(toolName: string, toolConfig: MCPTool): Promise<ToolTestResult> {
    const startTime = Date.now();
    
    try {
      if (toolConfig.enabled === false) {
        return {
          status: 'disabled',
          message: 'Tool is disabled in configuration',
          duration: Date.now() - startTime
        };
      }

      if (toolConfig.type === 'local') {
        return await this.testLocalTool(toolName, toolConfig);
      } else if (toolConfig.type === 'remote') {
        return await this.testRemoteTool(toolName, toolConfig);
      } else {
        return {
          status: 'error',
          message: `Unknown tool type: ${toolConfig.type}`,
          duration: Date.now() - startTime
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      };
    }
  }

  private async testLocalTool(toolName: string, toolConfig: MCPTool): Promise<ToolTestResult> {
    if (!toolConfig.command || toolConfig.command.length === 0) {
      return {
        status: 'error',
        message: 'No command specified'
      };
    }

    const baseCommand = toolConfig.command[0];
    const args = toolConfig.command.slice(1);

    // Test command availability
    if (baseCommand === 'npx') {
      return this.testNpxCommand(toolName, toolConfig);
    } else if (baseCommand === 'uvx') {
      return this.testUvxCommand(toolName, toolConfig);
    } else {
      return this.testSystemCommand(toolName, toolConfig);
    }
  }

  private async testNpxCommand(toolName: string, toolConfig: MCPTool): Promise<ToolTestResult> {
    const packageSpec = toolConfig.command![1];
    
    // Extract package name from command
    const packageName = packageSpec.replace('-y ', '').replace('@', '');
    
    console.log(`  📦 Testing npx package: ${packageName}`);

    const result = spawnSync('npx', ['-y', ...toolConfig.command!.slice(1), '--help'], {
      timeout: toolConfig.timeout || 15000,
      shell: true,
      stdio: 'pipe'
    });

    if (result.status === 0) {
      return {
        status: 'success',
        message: 'Package loads successfully'
      };
    } else if (result.error) {
      return {
        status: 'error',
        message: `Command failed: ${result.error.message}`
      };
    } else {
      return {
        status: 'warning',
        message: `Command exited with code ${result.status}`,
        stderr: result.stderr?.toString()
      };
    }
  }

  private async testUvxCommand(toolName: string, toolConfig: MCPTool): Promise<ToolTestResult> {
    console.log(`  🐍 Testing uvx command`);

    // First check if uvx is available
    const uvxCheck = spawnSync('uvx', ['--help'], {
      timeout: 5000,
      shell: true,
      stdio: 'pipe'
    });

    if (uvxCheck.status !== 0) {
      return {
        status: 'error',
        message: 'uvx is not installed or not available in PATH'
      };
    }

    const result = spawnSync('uvx', toolConfig.command!.slice(1), {
      timeout: toolConfig.timeout || 20000,
      shell: true,
      stdio: 'pipe'
    });

    if (result.status === 0) {
      return {
        status: 'success',
        message: 'uvx command executes successfully'
      };
    } else if (result.error) {
      return {
        status: 'error',
        message: `uvx command failed: ${result.error.message}`
      };
    } else {
      return {
        status: 'warning',
        message: `uvx command exited with code ${result.status}`,
        stderr: result.stderr?.toString()
      };
    }
  }

  private async testSystemCommand(toolName: string, toolConfig: MCPTool): Promise<ToolTestResult> {
    const command = toolConfig.command![0];
    console.log(`  🔧 Testing system command: ${command}`);

    const result = spawnSync(command, ['--help'], {
      timeout: toolConfig.timeout || 10000,
      shell: true,
      stdio: 'pipe'
    });

    if (result.status === 0) {
      return {
        status: 'success',
        message: 'System command available'
      };
    } else {
      return {
        status: 'error',
        message: `Command not found or failed: ${command}`
      };
    }
  }

  private async testRemoteTool(toolName: string, toolConfig: MCPTool): Promise<ToolTestResult> {
    if (!toolConfig.url) {
      return {
        status: 'error',
        message: 'No URL specified for remote tool'
      };
    }

    console.log(`  🌐 Testing remote URL: ${toolConfig.url}`);

    try {
      // Use native fetch (Node 18+) - no external dependency needed
      const response = await fetch(toolConfig.url, { 
        method: 'HEAD',
        signal: toolConfig.timeout ? AbortSignal.timeout(toolConfig.timeout) : undefined
      });

      if (response.ok) {
        return {
          status: 'success',
          message: 'Remote URL is accessible'
        };
      } else {
        return {
          status: 'warning',
          message: `URL returned status ${response.status}`
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Network error: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private printResult(toolName: string, result: ToolTestResult): void {
    const statusIcon = {
      success: '✅',
      warning: '⚠️ ',
      error: '❌',
      disabled: '⭕'
    };

    console.log(`  ${statusIcon[result.status]} ${toolName}: ${result.message}`);
    
    if (result.stderr) {
      console.log(`    stderr: ${result.stderr.substring(0, 200)}...`);
    }
  }

  private printSummary(): void {
    console.log('📊 Summary Report');
    console.log('=================');

    const total = this.results.size;
    const successful = Array.from(this.results.values()).filter(r => r.status === 'success').length;
    const warnings = Array.from(this.results.values()).filter(r => r.status === 'warning').length;
    const errors = Array.from(this.results.values()).filter(r => r.status === 'error').length;
    const disabled = Array.from(this.results.values()).filter(r => r.status === 'disabled').length;

    console.log(`Total tools: ${total}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`⭕ Disabled: ${disabled}`);

    if (errors > 0) {
      console.log('\n🔧 Troubleshooting Tips:');
      console.log('1. Check network connectivity for remote tools');
      console.log('2. Ensure Node.js and Python are in PATH');
      console.log('3. Run "npm install -g" for missing global packages');
      console.log('4. Install uvx for Python-based tools: pip install uvx');
      console.log('5. Check firewall/proxy settings for package downloads');
    }
  }
}

interface ToolTestResult {
  status: 'success' | 'warning' | 'error' | 'disabled';
  message: string;
  duration?: number;
  stderr?: string;
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new MCPVerifier();
  verifier.verifyAll().catch(console.error);
}

export { MCPVerifier, ToolTestResult };