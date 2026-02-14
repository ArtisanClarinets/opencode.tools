/**
 * OpenCode TUI Command Registration
 *
 * This file registers the Research Agent as a TUI-accessible command.
 * Import this into the main OpenCode TUI to make the Research Agent available.
 */
import { TUIResearchAgent } from './tui-agents';
/**
 * Research Agent TUI Command
 *
 * Usage in TUI:
 * - Navigate to Tools menu
 * - Select "Research Agent"
 * - Choose mode: Interactive, From Brief, or Quick Research
 */
export declare const researchCommand: {
    id: string;
    name: string;
    description: string;
    category: string;
    menu: {
        title: string;
        description: string;
        options: {
            key: string;
            label: string;
            description: string;
            action: () => Promise<void>;
        }[];
    };
};
/**
 * Register Research Agent with OpenCode TUI
 *
 * Call this function from the main TUI application to register the Research Agent
 */
export declare function registerResearchAgentWithTUI(tuiRegistry: any): void;
/**
 * Alternative: Direct TUI integration pattern
 *
 * If the TUI system supports direct integration, use this pattern:
 */
export declare const tuiIntegration: {
    /**
     * Initialize Research Agent in TUI context
     */
    initialize(tuiContext: any): void;
    /**
     * Get Research Agent instance for direct TUI access
     */
    getAgent(): TUIResearchAgent;
};
/**
 * Example TUI integration usage:
 *
 * // In main TUI application
 * import { tuiIntegration } from 'opencode-tools/src/tui-commands';
 *
 * // Initialize Research Agent
 * tuiIntegration.initialize(tuiContext);
 *
 * // Access Research Agent directly
 * const agent = tuiIntegration.getAgent();
 * await agent.runInteractive();
 */
//# sourceMappingURL=tui-commands.d.ts.map