import * as React from 'react';
import { Box, Text, Newline } from 'ink';
import { useStore } from '../store/store';
import Spinner from 'ink-spinner';
import { Session, AgentActivity } from '../types';

export const DashboardScreen: React.FC = () => {
  const { state, dispatch } = useStore();
  const activeSession = state.sessions.find(s => s.id === state.activeSessionId);

  if (!activeSession) {
    return (
      <Box padding={2}>
        <Text color="red">No active session for dashboard.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingX={2}>
      <Box marginBottom={1}>
        <Text bold underline color="cyan">TEAM DASHBOARD - {activeSession.name}</Text>
      </Box>

      <Box flexDirection="row" marginBottom={1}>
        <Box flexDirection="column" width="70%">
            <Text bold>Agent Status</Text>
            {activeSession.activities.length === 0 ? (
                <Text color="gray">No agents active in this session.</Text>
            ) : (
                activeSession.activities.map((activity, index) => (
                    <AgentCard key={activity.agentId} activity={activity} />
                ))
            )}
        </Box>

        <Box flexDirection="column" width="30%" paddingLeft={2} borderStyle="single">
            <Text bold>Stats</Text>
            <Text>Status: <StatusColor status={activeSession.status}>{activeSession.status.toUpperCase()}</StatusColor></Text>
            <Text>Messages: {activeSession.messages.length}</Text>
            <Text>Created: {new Date(activeSession.createdAt).toLocaleDateString()}</Text>
        </Box>
      </Box>

      <Box flexDirection="column" marginTop={1}>
          <Text bold>Global Activity Feed</Text>
          <Box borderStyle="round" paddingX={1} height={6}>
            <Text>
                {activeSession.messages
                    .filter(m => m.role === 'log' || m.role === 'system')
                    .slice(-5)
                    .map(m => (
                        <Box key={m.id}>
                            <Text color="gray">[{new Date(m.timestamp).toLocaleTimeString()}] </Text>
                            <Text>{m.content}</Text>
                        </Box>
                    ))
                }
            </Text>
          </Box>
      </Box>

      <Box marginTop={1}>
          <Text color="gray">Press </Text>
          <Text color="cyan" bold>C</Text>
          <Text color="gray"> to go to Chat, </Text>
          <Text color="cyan" bold>H</Text>
          <Text color="gray"> for Home.</Text>
      </Box>
    </Box>
  );
};

const AgentCard: React.FC<{ activity: AgentActivity }> = ({ activity }) => {
    const isWorking = ['thinking', 'working', 'completing'].includes(activity.status);

    return (
        <Box padding={1} borderStyle="round" borderColor={isWorking ? "yellow" : "green"} marginBottom={0}>
            <Box width={20}>
                <Text bold color="white">{activity.agentName}</Text>
            </Box>
            <Box width={15}>
                {isWorking && <Text color="yellow"><Spinner type="dots" /> </Text>}
                <StatusColor status={activity.status as any}>{activity.status.toUpperCase()}</StatusColor>
            </Box>
            <Box flexGrow={1}>
                <Text color="gray" wrap="truncate-end">{activity.lastLog || 'Waiting...'}</Text>
            </Box>
            {activity.progress !== undefined && (
                <Box marginLeft={2}>
                    <Text>[{activity.progress}%]</Text>
                </Box>
            )}
        </Box>
    );
};

const StatusColor: React.FC<{ status: string }> = ({ status, children }) => {
    switch (status) {
        case 'idle': return <Text color="gray">{children}</Text>;
        case 'thinking':
        case 'working':
        case 'refining':
            return <Text color="yellow">{children}</Text>;
        case 'success':
        case 'completed':
            return <Text color="green">{children}</Text>;
        case 'failed': return <Text color="red">{children}</Text>;
        default: return <Text>{children}</Text>;
    }
};
