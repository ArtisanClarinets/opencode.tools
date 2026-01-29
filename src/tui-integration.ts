import { TUIResearchAgent } from './tui-agents';
import { ResearchParams } from './tui-agents';
import * as fs from 'fs';

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
  handler: (args: unknown) => Promise<unknown>;
  parameters?: TUIParameter[];
}

export interface TUIParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  description: string;
  default?: unknown;
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
    handler: async (args: unknown) => {
      const researchArgs = args as ResearchArgs;
      const agent = new TUIResearchAgentExtended();
      
      if (researchArgs.mode === 'interactive') {
        await agent.runInteractive();
        return { success: true, message: 'Research completed interactively' };
      } else if (researchArgs.mode === 'brief' && researchArgs.briefPath) {
        return await agent.runWithBriefFile(researchArgs.briefPath);
      } else if (researchArgs.mode === 'quick' && researchArgs.company && researchArgs.industry) {
        const params: ResearchParams = {
          company: researchArgs.company,
          industry: researchArgs.industry,
          description: researchArgs.description,
          goals: researchArgs.goals,
          constraints: researchArgs.constraints,
          timeline: researchArgs.timeline,
          keywords: researchArgs.keywords
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
  
  return tools;
}

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
  async runWithBriefFile(briefPath: string, _outputPath?: string): Promise<unknown> {
    // Validate path
    if (!fs.existsSync(briefPath) || !fs.statSync(briefPath).isFile()) {
        throw new Error(`Invalid brief path: ${briefPath}`);
    }

    const briefContent = await fs.promises.readFile(briefPath, 'utf-8');
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
  async runWithParams(params: ResearchParams): Promise<unknown> {
    return super.runWithParams(params);
  }
}
