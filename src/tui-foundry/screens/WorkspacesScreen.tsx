import React from 'react';
import { Box, Text } from 'ink';
import { useStore } from '../store/store';
import { Panel } from '../components/common';

export function WorkspacesScreen(): React.ReactElement {
  const { state } = useStore();

  return React.createElement(Panel, { title: 'Workspaces' },
    React.createElement(Box, { flexDirection: 'column' },
      React.createElement(Text, null, `Active project: ${state.activeProjectId ?? 'none'}`),
      React.createElement(Text, null, 'Workspace list is sourced from Cowork runtime controllers.'),
    ),
  );
}
