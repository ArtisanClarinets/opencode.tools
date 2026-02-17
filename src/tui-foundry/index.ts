import * as React from 'react';
import { render } from 'ink';
import { getTuiRuntime } from 'src/tui-foundry/runtime/tui-runtime';
import { FoundryApp } from 'src/tui-foundry/App';

export async function startFoundryTui(): Promise<void> {
  await getTuiRuntime();
  const { waitUntilExit } = render(React.createElement(FoundryApp));
  await waitUntilExit();
}
