import * as React from 'react';
import { Box, Text, useInput } from 'ink';
import { useStore } from '../store/store';
import { AGENTS } from '../agents';
import { ChatInterface } from '../components/ChatInterface';
import { createLogMessage, createAgentMessage, createUserMessage } from '../utils/logger';

export const ChatScreen: React.FC = () => {
  const { state, dispatch } = useStore();
  const session = state.sessions.find(s => s.id === state.activeSessionId);

  if (!session) {
    return <Text color="red">Session not found</Text>;
  }

  const agent = AGENTS.find(a => a.id === session.agentId);

  // Handle Esc to go back
  useInput((input, key) => {
    if (key.escape) {
      dispatch({ type: 'GO_HOME' });
    }
  });

  // Effect to start the conversation if empty
  React.useEffect(() => {
    if (session.messages.length === 0 && agent && agent.steps.length > 0) {
      dispatch({ type: 'ADD_MESSAGE', sessionId: session.id, message: createAgentMessage(agent.steps[0].question) });
    }
  }, [session.id, agent]);

  const runAgentExecution = async (sessionId: string, answers: any) => {
      try {
          if (!agent) return;
          await agent.execute(answers, (log: string) => {
              dispatch({ type: 'ADD_MESSAGE', sessionId, message: createLogMessage(log) });
          });
          dispatch({ type: 'ADD_MESSAGE', sessionId, message: createAgentMessage("Execution completed successfully.") });
          dispatch({ type: 'SET_STATUS', sessionId, status: 'completed' });
      } catch (err: any) {
          dispatch({ type: 'ADD_MESSAGE', sessionId, message: createAgentMessage(`Error: ${err.message}`) });
          dispatch({ type: 'SET_STATUS', sessionId, status: 'failed' });
      }
  };

  const handleSendMessage = async (content: string) => {
    if (!agent) return;
    if (session.status === 'running') return; // Ignore input while running

    // Add user message
    dispatch({ type: 'ADD_MESSAGE', sessionId: session.id, message: createUserMessage(content) });

    // Check for special commands
    if (content.trim() === '/back') {
        dispatch({ type: 'GO_HOME' });
        return;
    }

    // Determine current step index based on answers
    const currentStepIndex = Object.keys(session.answers).length;

    if (currentStepIndex < agent.steps.length) {
      const step = agent.steps[currentStepIndex];

      // Update answers
      const newAnswers = { ...session.answers, [step.key]: content };
      dispatch({ type: 'UPDATE_ANSWERS', sessionId: session.id, answers: newAnswers });

      // Determine next step
      const nextStepIndex = currentStepIndex + 1;

      if (nextStepIndex < agent.steps.length) {
        // Ask next question
        const nextStep = agent.steps[nextStepIndex];
        setTimeout(() => {
           dispatch({ type: 'ADD_MESSAGE', sessionId: session.id, message: createAgentMessage(nextStep.question) });
        }, 300);
      } else {
        // All steps done, start execution
        dispatch({ type: 'SET_STATUS', sessionId: session.id, status: 'running' });
        setTimeout(() => {
           dispatch({ type: 'ADD_MESSAGE', sessionId: session.id, message: createAgentMessage("All inputs received. Starting execution...") });
           runAgentExecution(session.id, newAnswers);
        }, 300);
      }
    } else {
        if (session.status === 'completed' || session.status === 'failed') {
             dispatch({ type: 'ADD_MESSAGE', sessionId: session.id, message: createAgentMessage("Session ended. Start a new chat to run again.") });
        }
    }
  };

  return (
    <Box flexDirection="column" flexGrow={1} height="100%">
        <Box flexDirection="row" justifyContent="space-between" paddingX={1} borderStyle="single" borderColor="gray">
            <Text bold>Chat: {session.name}</Text>
            <Text color="gray"> (Status: {session.status} | Esc to Back)</Text>
        </Box>
      <ChatInterface
        messages={session.messages}
        onSendMessage={handleSendMessage}
        prompt={`${agent?.name || 'Agent'}> `}
        placeholder={session.status === 'running' ? 'Agent is running...' : 'Type your answer...'}
      />
    </Box>
  );
};
