/**
 * OpenCode Tools - TUI Integration Entry Point
 *
 * This module provides the integration point for OpenCode TUI.
 * All tools are registered here and made available exclusively through the TUI.
 */
import { registerTUITools } from './tui-integration';
import { TUIResearchAgent } from './tui-agents';
export { registerTUITools };
export { TUIResearchAgent };
export type { ResearchParams, ResearchResult } from './tui-agents';
export type { TUITool, TUIParameter } from './tui-integration';
/**
 * Get all available TUI tools
 */
export declare function getAvailableTools(): import("./tui-integration").TUITool[];
/**
 * Execute a specific tool by ID (called by TUI)
 */
export declare function executeTool(toolId: string, args: any): Promise<any>;
/**
 * Research tool shortcuts for TUI
 */
export declare const researchTools: {
    /**
     * Run interactive research (full TUI prompts)
     */
    interactive(): Promise<void>;
    /**
     * Run research from brief file
     */
    fromBrief(briefPath: string, outputPath?: string): Promise<import("./tui-agents").ResearchResult>;
    /**
     * Run quick research
     */
    quick(company: string, industry: string, description?: string): Promise<import("./tui-agents").ResearchResult>;
};
//# sourceMappingURL=index.d.ts.map