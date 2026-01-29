/**
 * OpenCode Tools - TUI Integration Entry Point
 * 
 * This module provides the integration point for OpenCode TUI.
 * All tools are registered here and made available exclusively through the TUI.
 */

import { registerTUITools } from './tui-integration';
import { TUIResearchAgent, ResearchParams } from './tui-agents';

// Export the tool registration function
export { registerTUITools };

// Export individual agents for direct TUI access if needed
export { TUIResearchAgent };

// Export types
export type { ResearchParams, ResearchResult } from './tui-agents';
export type { TUITool, TUIParameter } from './tui-integration';

/**
 * Get all available TUI tools
 */
export function getAvailableTools() {
  return registerTUITools();
}

/**
 * Execute a specific tool by ID (called by TUI)
 */
export async function executeTool(toolId: string, args: unknown): Promise<unknown> {
  const tools = registerTUITools();
  const tool = tools.find(t => t.id === toolId);
  
  if (!tool) {
    throw new Error(`Tool not found: ${toolId}`);
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await tool.handler(args as any);
}

/**
 * Research tool shortcuts for TUI
 */
export const researchTools = {
  /**
   * Run interactive research (full TUI prompts)
   */
  async interactive() {
    const agent = new TUIResearchAgent();
    await agent.runInteractive();
  },
  
  /**
   * Run research from brief file
   */
  async fromBrief(briefPath: string) {
    const agent = new TUIResearchAgent();
    // Implementation would handle file reading
    const params = await loadBriefFromFile(briefPath);
    return agent.runWithParams(params);
  },
  
  /**
   * Run quick research
   */
  async quick(company: string, industry: string, description?: string) {
    const agent = new TUIResearchAgent();
    return agent.runWithParams({
      company,
      industry,
      description: description || `${company} operates in the ${industry} industry.`
    });
  }
};

/**
 * Helper function to load brief from file
 */
async function loadBriefFromFile(briefPath: string): Promise<ResearchParams> {
  const fs = await import('fs');
  const content = await fs.promises.readFile(briefPath, 'utf-8');
  return JSON.parse(content) as ResearchParams;
}
