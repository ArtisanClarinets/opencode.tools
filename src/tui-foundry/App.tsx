import * as React from 'react';
import { Box, Text, useInput } from 'ink';
import { FoundryStoreProvider, useFoundryStore } from 'src/tui-foundry/store/store';
import { RuntimeProvider } from 'src/tui-foundry/runtime/context';
import { SCREEN_ORDER } from 'src/tui-foundry/types';
import { DashboardScreen } from 'src/tui-foundry/screens/DashboardScreen';
import { ProjectScreen } from 'src/tui-foundry/screens/ProjectScreen';
import { AgentHubScreen } from 'src/tui-foundry/screens/AgentHubScreen';
import { ExecutionScreen } from 'src/tui-foundry/screens/ExecutionScreen';
import { ChatScreen } from 'src/tui-foundry/screens/ChatScreen';
import { WorkspacesScreen } from 'src/tui-foundry/screens/WorkspacesScreen';
import { WorkspaceDetailScreen } from 'src/tui-foundry/screens/WorkspaceDetailScreen';
import { AuditScreen } from 'src/tui-foundry/screens/AuditScreen';
import { SettingsScreen } from 'src/tui-foundry/screens/SettingsScreen';

const ScreenRouter: React.FC = () => {
  const { state, setScreen } = useFoundryStore();

  useInput((input) => {
    const index = Number.parseInt(input, 10);
    if (!Number.isNaN(index) && index >= 1 && index <= SCREEN_ORDER.length) {
      setScreen(SCREEN_ORDER[index - 1]);
    }
  });

  return (
    <Box flexDirection="column">
      <Text>Foundry TUI · [1-9] switch screens</Text>
      {state.activeScreen === 'dashboard' && <DashboardScreen />}
      {state.activeScreen === 'project' && <ProjectScreen />}
      {state.activeScreen === 'agentHub' && <AgentHubScreen />}
      {state.activeScreen === 'execution' && <ExecutionScreen />}
      {state.activeScreen === 'chat' && <ChatScreen />}
      {state.activeScreen === 'workspaces' && <WorkspacesScreen />}
      {state.activeScreen === 'workspace' && <WorkspaceDetailScreen />}
      {state.activeScreen === 'audit' && <AuditScreen />}
      {state.activeScreen === 'settings' && <SettingsScreen />}
    </Box>
  );
};

export const FoundryApp: React.FC = () => (
  <RuntimeProvider>
    <FoundryStoreProvider>
      <ScreenRouter />
    </FoundryStoreProvider>
  </RuntimeProvider>
);
