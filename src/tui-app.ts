import * as React from 'react';
import { render } from 'ink';
import { App } from './tui/App';

/**
 * OpenCode TUI Application Entry Point
 *
 * Replaces the previous readline-based implementation with a React Ink TUI.
 */
export async function startTui() {
  // Clear the console for a clean TUI start
  process.stdout.write('\x1b[2J\x1b[0f');

  // Render the Ink app
  const { waitUntilExit } = render(React.createElement(App));

  try {
    await waitUntilExit();
  } catch (error) {
    console.error('TUI Error:', error);
    process.exit(1);
  }
}

// Start the TUI if run directly
if (require.main === module) {
  startTui().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
