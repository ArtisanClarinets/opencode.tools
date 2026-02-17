import React from 'react';
import { Box, Text } from 'ink';
import { useStore } from '../store/store';
import { Panel, Badge, ProgressBar } from '../components/common';

export function AgentHubScreen(): React.ReactElement {
  const { state } = useStore();

  return React.createElement(Box, { flexDirection: 'row', flexGrow: 1 },
    React.createElement(Box, { width: '50%', marginRight: 1 },
      React.createElement(Panel, { title: 'Team' },
        state.team.map(member => React.createElement(Box, { key: member.id, marginBottom: 1 },
          React.createElement(Text, { bold: true }, member.name),
          React.createElement(Badge, { status: member.status }),
        )),
      ),
    ),
    React.createElement(Box, { width: '50%' },
      React.createElement(Panel, { title: 'Active Agents' },
        state.agents.map(agent => React.createElement(Box, { key: agent.id, flexDirection: 'column', marginBottom: 1 },
          React.createElement(Text, null, `${agent.name} (${agent.roleLabel})`),
          React.createElement(ProgressBar, { percent: agent.progress }),
        )),
      ),
    ),
  );
}
