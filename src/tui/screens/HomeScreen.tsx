import * as React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { useStore } from '../store/store';
import { AGENTS } from '../agents';
import { COLORS } from '../styles';

export const HomeScreen: React.FC = () => {
  const { state, dispatch } = useStore();
  const [showAgentList, setShowAgentList] = React.useState(false);

  if (showAgentList) {
    const agentItems = AGENTS.map(a => ({
      label: a.name,
      value: a.id,
    }));

    // Add back option
    const items = [
        ...agentItems,
        { label: '<< Back', value: 'back' }
    ];

    return (
      <Box flexDirection="column" padding={1} borderStyle="round" borderColor={COLORS.secondary}>
        <Box marginBottom={1}>
          <Text bold color={COLORS.secondary}>Select an Agent:</Text>
        </Box>
        <SelectInput
          items={items}
          onSelect={(item) => {
            if (item.value === 'back') {
                setShowAgentList(false);
            } else {
                dispatch({ type: 'CREATE_SESSION', agentId: item.value, agentName: item.label });
            }
          }}
        />
      </Box>
    );
  }

  const items = [
    { label: '+ Start New Chat', value: 'new_chat' },
    ...state.sessions.map(s => ({
      label: `${s.name} (${new Date(s.updatedAt).toLocaleTimeString()})`,
      value: s.id,
    })),
  ];

  return (
    <Box flexDirection="column" padding={1} borderStyle="round" borderColor={COLORS.primary}>
      <Box marginBottom={1}>
        <Text bold color={COLORS.primary}>Welcome to OpenCode Tools</Text>
      </Box>
      <SelectInput
        items={items}
        onSelect={(item) => {
            if (item.value === 'new_chat') {
                setShowAgentList(true);
            } else {
                dispatch({ type: 'SELECT_SESSION', sessionId: item.value });
            }
        }}
      />
    </Box>
  );
};
