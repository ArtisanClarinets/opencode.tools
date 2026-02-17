import React from 'react';
import { Box, Text } from 'ink';
import { Panel } from '../components/common';

export function WorkspaceDetailScreen(): React.ReactElement {
  return React.createElement(Box, { flexDirection: 'row', flexGrow: 1 },
    React.createElement(Box, { width: '33%', marginRight: 1 }, React.createElement(Panel, { title: 'Artifacts' }, React.createElement(Text, null, 'Versioned artifacts'))),
    React.createElement(Box, { width: '33%', marginRight: 1 }, React.createElement(Panel, { title: 'Feedback' }, React.createElement(Text, null, 'Critical and blocking threads'))),
    React.createElement(Box, { width: '34%' }, React.createElement(Panel, { title: 'Conflicts & Checkpoints' }, React.createElement(Text, null, 'Resolve conflicts and restore checkpoints'))),
  );
}
