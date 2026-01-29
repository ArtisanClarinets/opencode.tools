import { registerTUITools } from './index';
import * as readline from 'readline';

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

  const tools = registerTUITools();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = (query: string): Promise<string> => new Promise(resolve => rl.question(query, resolve));

  try {
    let running = true;
    while (running) {
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
          } else {
            console.log('Tool handler not fully implemented for interactive mode.');
          }
        } catch (error: unknown) {
           if (error instanceof Error) {
            console.error('Error running tool:', error.message);
          } else {
            console.error('Error running tool:', String(error));
          }
        }
        console.log('\n----------------------------------------\n');

      } else if (index === tools.length) {
        console.log('Goodbye!');
        running = false;
      } else {
        console.log('Invalid selection. Please try again.\n');
      }
    }
  } finally {
    rl.close();
  }
}

// Start the TUI
// eslint-disable-next-line @typescript-eslint/no-var-requires
if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
