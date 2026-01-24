import { TUIResearchAgent } from './tui-agents';
import { ResearchParams } from './tui-agents';
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
export declare function registerTUITools(): TUITool[];
/**
 * Extended TUI Research Agent with file support
 */
export declare class TUIResearchAgentExtended extends TUIResearchAgent {
    /**
     * Run research from a brief file (TUI-accessible)
     */
    runWithBriefFile(briefPath: string, outputPath?: string): Promise<any>;
    /**
     * Run research with parameters (TUI-accessible)
     */
    runWithParams(params: ResearchParams): Promise<any>;
}
//# sourceMappingURL=tui-integration.d.ts.map