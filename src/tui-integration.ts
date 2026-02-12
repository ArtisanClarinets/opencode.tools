import { TUIResearchAgent } from './tui-agents';
import { TUIArchitectureAgent } from './tui-agents/tui-architecture-agent';
import { TUICodeGenAgent } from './tui-agents/tui-codegen-agent';
import { ResearchParams } from './tui-agents';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { discoverBundledPlugins, PluginManifest } from './plugins/discovery';

/**
 * OpenCode TUI Tools Registration
 * 
 * This module registers all TUI-accessible tools with the OpenCode TUI system.
 * These tools are ONLY accessible through the TUI interface and cannot be
 * called via standalone CLI commands.
 */

export interface TUITool {
  id: string;
  name: string;
  description: string;
  category: 'research' | 'documentation' | 'codegen' | 'qa' | 'delivery';
  handler: (args: any) => Promise<any>;
  parameters?: TUIParameter[];
}

export interface TUIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  description: string;
  default?: any;
}

/**
 * Register TUI tools with OpenCode
 */
export function registerTUITools(): TUITool[] {
  const tools: TUITool[] = [];
  
  // Register Research Agent
  tools.push({
    id: 'research-agent',
    name: 'Research Agent',
    description: 'Automated client and industry research with competitor analysis',
    category: 'research',
    handler: async (args: ResearchArgs) => {
      const agent = new TUIResearchAgentExtended();
      
      if (args.mode === 'interactive') {
        await agent.runInteractive();
        return { success: true, message: 'Research completed interactively' };
      } else if (args.mode === 'brief' && args.briefPath) {
        return await agent.runWithBriefFile(args.briefPath, args.outputPath);
      } else if (args.mode === 'quick' && args.company && args.industry) {
        const params: ResearchParams = {
          company: args.company,
          industry: args.industry,
          description: args.description,
          goals: args.goals,
          constraints: args.constraints,
          timeline: args.timeline,
          keywords: args.keywords
        };
        return await agent.runWithParams(params);
      } else {
        throw new Error('Invalid research parameters');
      }
    },
    parameters: [
      {
        name: 'mode',
        type: 'string',
        required: true,
        description: 'Research mode: interactive, brief, or quick',
        default: 'interactive'
      }
    ]
  });

  // Register Architecture Agent
  tools.push({
    id: 'architecture-agent',
    name: 'Architecture Agent',
    description: 'System design and backlog generation',
    category: 'documentation',
    handler: async () => {
      const agent = new TUIArchitectureAgent();
      await agent.runInteractive();
      return { success: true };
    }
  });

  // Register CodeGen Agent
  tools.push({
    id: 'codegen-agent',
    name: 'CodeGen Agent',
    description: 'Feature scaffolding and code generation',
    category: 'codegen',
    handler: async () => {
      const agent = new TUICodeGenAgent();
      await agent.runInteractive();
      return { success: true };
    }
  });
  
  // Discover bundled plugin manifests and register them as TUI tools (read-only discovery)
  const manifests = discoverBundledPlugins();
  for (const manifest of manifests) {
    try {
      const toolId = manifest.id || `plugin:${manifest.name}`;
      const toolName = manifest.name || toolId;
      const description = `Plugin adapterType=${manifest.adapterType} capabilities=${(manifest.capabilities||[]).join(', ')} license=${manifest.license || 'unknown'}`;

      tools.push({
        id: toolId,
        name: toolName,
        description,
        category: 'research',
        handler: async (args: any) => {
          // By default return manifest metadata. To execute the plugin set args.run = true
          if (!args || !args.run) {
            return { manifest };
          }

          // Execution requested - run the entryPoint.cmd if provided (best-effort)
          const cmd: string[] = manifest.entryPoint?.cmd || [];
          if (!Array.isArray(cmd) || cmd.length === 0) {
            throw new Error('No executable command declared in plugin manifest');
          }

          const child = spawn(cmd[0], cmd.slice(1), { stdio: ['pipe', 'pipe', 'pipe'] });
          let stdout = '';
          let stderr = '';
          child.stdout.on('data', d => (stdout += d.toString()));
          child.stderr.on('data', d => (stderr += d.toString()));

          const exitCode: number = await new Promise((resolve) => child.on('close', resolve));
          if (exitCode !== 0) {
            throw new Error(`Plugin process exited with code=${exitCode} stderr=${stderr}`);
          }

          // Try parsing JSON output, otherwise return raw stdout
          try {
            return JSON.parse(stdout);
          } catch (err) {
            return { stdout, stderr };
          }
        }
      });
    } catch (err) {
      // ignore malformed manifest
    }
  }

  return tools;
}

// discovery is delegated to src/plugins/discovery.ts

interface ResearchArgs {
  mode: 'interactive' | 'brief' | 'quick';
  briefPath?: string;
  outputPath?: string;
  company?: string;
  industry?: string;
  description?: string;
  goals?: string[];
  constraints?: string[];
  timeline?: string;
  keywords?: string[];
}

/**
 * Extended TUI Research Agent with file support
 */
export class TUIResearchAgentExtended extends TUIResearchAgent {
  
  /**
   * Run research from a brief file (TUI-accessible)
   */
  async runWithBriefFile(briefPath: string, outputPath?: string): Promise<any> {
    const briefContent = await import('fs').then(fs => 
      fs.promises.readFile(briefPath, 'utf-8')
    );
    const brief = JSON.parse(briefContent);
    
    const params: ResearchParams = {
      company: brief.company,
      industry: brief.industry,
      description: brief.description,
      goals: brief.goals,
      constraints: brief.constraints,
      timeline: brief.timeline,
      keywords: brief.keywords,
      urls: brief.urls,
      priorNotes: brief.priorNotes
    };
    
    return this.runWithParams(params);
  }
  
  /**
   * Run research with parameters (TUI-accessible)
   */
  async runWithParams(params: ResearchParams): Promise<any> {
    return super.runWithParams(params);
  }
}
