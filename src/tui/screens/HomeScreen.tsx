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
    const items = [
        ...AGENTS.map(a => ({ label: `🚀 ${a.name} - ${a.description}`, value: a.id })),
        { label: '⬅️  Go Back', value: 'back' }
    ];

    return (
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Box marginBottom={1}>
          <Text bold color={COLORS.secondary} underline>START A NEW VENTURE</Text>
        </Box>
        <SelectInput
          items={items}
          onSelect={(item: any) => {
            if (item.value === 'back') {
                setShowAgentList(false);
            } else {
                dispatch({ type: 'CREATE_SESSION', agentId: item.value, agentName: (item.label.split('-')[0] || item.label).trim().replace('🚀 ', '') });
            }
          }}
        />
      </Box>
    );
  }

  const sessionItems = state.sessions.map(s => {
      const statusIcon = s.status === 'completed' ? '✅' : s.status === 'running' ? '⏳' : '💬';
      return {
          label: `${statusIcon} ${s.name} (${new Date(s.updatedAt).toLocaleTimeString()})`,
          value: s.id,
      };
  });

  const items = [
    { label: '✨ New Interactive Chat', value: 'new_chat' },
    ...sessionItems,
  ];

  return (
    <Box flexDirection="column" paddingX={2} paddingY={1}>
      <Box marginBottom={1} flexDirection="row" justifyContent="space-between">
        <Text bold color={COLORS.primary}>OPENCODE OS v1.0</Text>
        <Text color="gray">System: Online | CEO: Connected</Text>
      </Box>
      
      <Box borderStyle="single" borderColor={COLORS.border} paddingX={1} flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color={COLORS.highlight}>RESUME SESSION</Text>
        </Box>
        <SelectInput
            items={items}
            onSelect={(item: any) => {
                if (item.value === 'new_chat') {
                    setShowAgentList(true);
                } else {
                    dispatch({ type: 'SELECT_SESSION', sessionId: item.value });
                }
            }}
        />
      </Box>

      <Box marginTop={1}>
          <Text color="gray">Active sessions: {state.sessions.length} | Commands: [D] Dashboard [H] Home [Esc] Back</Text>
      </Box>
    </Box>
  );
};
