"use strict";
/**
 * OpenCode TUI Command Registration
 *
 * This file registers the Research Agent as a TUI-accessible command.
 * Import this into the main OpenCode TUI to make the Research Agent available.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tuiIntegration = exports.researchCommand = void 0;
exports.registerResearchAgentWithTUI = registerResearchAgentWithTUI;
const index_1 = require("./index");
/**
 * Research Agent TUI Command
 *
 * Usage in TUI:
 * - Navigate to Tools menu
 * - Select "Research Agent"
 * - Choose mode: Interactive, From Brief, or Quick Research
 */
exports.researchCommand = {
    id: 'research-agent',
    name: 'Research Agent',
    description: 'Automated client and industry research',
    category: 'Research Tools',
    // TUI menu structure
    menu: {
        title: 'Research Agent',
        description: 'Generate comprehensive research dossiers for client projects',
        options: [
            {
                key: '1',
                label: '🔄 Interactive Research',
                description: 'Guided research with TUI prompts',
                action: async () => {
                    await index_1.researchTools.interactive();
                }
            },
            {
                key: '2',
                label: '📄 Research from Brief',
                description: 'Research using client brief file',
                action: async () => {
                    // This would integrate with TUI file picker
                    const briefPath = await tuiFilePicker('Select client brief file:');
                    if (briefPath) {
                        await index_1.researchTools.fromBrief(briefPath);
                    }
                }
            },
            {
                key: '3',
                label: '⚡ Quick Research',
                description: 'Fast research with minimal input',
                action: async () => {
                    const company = await tuiPrompt('Company name:');
                    const industry = await tuiPrompt('Industry:');
                    const description = await tuiPrompt('Description (optional):');
                    if (company && industry) {
                        await index_1.researchTools.quick(company, industry, description);
                    }
                }
            }
        ]
    }
};
/**
 * Register Research Agent with OpenCode TUI
 *
 * Call this function from the main TUI application to register the Research Agent
 */
function registerResearchAgentWithTUI(tuiRegistry) {
    tuiRegistry.registerCommand(exports.researchCommand);
}
/**
 * TUI Helper functions (these would be provided by the main TUI system)
 * These are placeholders that should be replaced with actual TUI implementations
 */
async function tuiPrompt(message) {
    // This would be replaced with actual TUI prompt
    return new Promise((resolve) => {
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(message + ' ', (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}
async function tuiFilePicker(message) {
    // This would be replaced with actual TUI file picker
    const path = await tuiPrompt(message + ' (enter path)');
    return path || null;
}
/**
 * Alternative: Direct TUI integration pattern
 *
 * If the TUI system supports direct integration, use this pattern:
 */
exports.tuiIntegration = {
    /**
     * Initialize Research Agent in TUI context
     */
    initialize(tuiContext) {
        // Register the research agent tool
        tuiContext.tools.register({
            id: 'research-agent',
            name: 'Research Agent',
            category: 'Research',
            description: 'Automated client and industry research',
            // TUI-specific handlers
            handlers: {
                interactive: index_1.researchTools.interactive,
                fromBrief: index_1.researchTools.fromBrief,
                quick: index_1.researchTools.quick
            },
            // TUI menu integration
            menuItems: [
                {
                    label: 'Research Agent',
                    submenu: [
                        { label: 'Interactive Mode', action: 'interactive' },
                        { label: 'From Brief File', action: 'fromBrief' },
                        { label: 'Quick Research', action: 'quick' }
                    ]
                }
            ]
        });
    },
    /**
     * Get Research Agent instance for direct TUI access
     */
    getAgent() {
        return new (require('./tui-agents').TUIResearchAgent)();
    }
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
//# sourceMappingURL=tui-commands.js.map