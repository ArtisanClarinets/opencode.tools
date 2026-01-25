"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
/**
 * OpenCode TUI Application Entry Point
 *
 * This is the main interface for interacting with OpenCode Tools.
 * All functionality is accessed through this interactive menu.
 */
async function main() {
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║           OPENCODE TOOLS TUI               ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('\nWelcome! Select a tool to begin:\n');
    const tools = (0, index_1.registerTUITools)();
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const ask = (query) => new Promise(resolve => rl.question(query, resolve));
    try {
        while (true) {
            // Display tools menu
            tools.forEach((tool, index) => {
                console.log(`${index + 1}. ${tool.name}`);
                console.log(`   ${tool.description}`);
            });
            console.log(`\n${tools.length + 1}. Exit`);
            const choice = await ask('\nEnter selection: ');
            const index = parseInt(choice) - 1;
            if (index >= 0 && index < tools.length) {
                const tool = tools[index];
                console.log(`\nLaunching ${tool.name}...\n`);
                try {
                    // For Research Agent, we launch the interactive mode by default
                    if (tool.id === 'research-agent') {
                        await tool.handler({ mode: 'interactive' });
                    }
                    else {
                        console.log('Tool handler not fully implemented for interactive mode.');
                    }
                }
                catch (error) {
                    console.error('Error running tool:', error.message);
                }
                console.log('\n----------------------------------------\n');
            }
            else if (index === tools.length) {
                console.log('Goodbye!');
                break;
            }
            else {
                console.log('Invalid selection. Please try again.\n');
            }
        }
    }
    finally {
        rl.close();
    }
}
// Start the TUI
if (require.main === module) {
    main().catch(err => {
        console.error('Fatal error:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=tui-app.js.map