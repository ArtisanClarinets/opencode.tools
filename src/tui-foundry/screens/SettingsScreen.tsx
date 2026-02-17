import React from 'react';
import { Box, Text } from 'ink';
import { useStore } from '../store/store';
import { Panel } from '../components/common';

export function SettingsScreen(): React.ReactElement {
  const { state } = useStore();

  return React.createElement(Box, { flexDirection: 'row', flexGrow: 1 },
    React.createElement(Box, { width: '50%', marginRight: 1 },
      React.createElement(Panel, { title: 'LLM' },
        React.createElement(Text, null, `Provider: ${state.llmConfig.provider}`),
        React.createElement(Text, null, `Model: ${state.llmConfig.model}`),
      ),
    ),
    React.createElement(Box, { width: '50%' },
      React.createElement(Panel, { title: 'Runtime' },
        React.createElement(Text, null, `Theme: ${state.settings.theme}`),
        React.createElement(Text, null, `Notifications: ${state.settings.showNotifications ? 'on' : 'off'}`),
      ),
    ),
  );
}
