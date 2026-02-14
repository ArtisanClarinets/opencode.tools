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

          // Initialize activities for the dashboard if not already set
          if (session.activities.length === 0) {
              dispatch({
                  type: 'SET_ACTIVITIES',
                  sessionId,
                  activities: [
                      { agentId: 'research', agentName: 'PhD Researcher', status: 'thinking', lastLog: 'Initializing...' },
                      { agentId: 'architect', agentName: 'Senior Architect', status: 'idle' },
                      { agentId: 'codegen', agentName: 'Lead Dev', status: 'idle' }
                  ]
              });
          }

          // In REPL mode, execute acts as an initializer
          await agent.execute(answers, (log: string) => {
              dispatch({ type: 'ADD_MESSAGE', sessionId, message: createLogMessage(log) });
              
              // Intelligent Dashboard Updates based on log content
              // (Keep existing logic or extend for REPL events)
              if (log.toLowerCase().includes('research') || log.toLowerCase().includes('searching')) {
                  dispatch({ type: 'UPDATE_ACTIVITY', sessionId, activity: { agentId: 'research', status: 'working', lastLog: log } });
              } else if (log.toLowerCase().includes('architect') || log.toLowerCase().includes('designing')) {
                   dispatch({ type: 'UPDATE_ACTIVITY', sessionId, activity: { agentId: 'research', status: 'success', lastLog: 'Knowledge base complete.' } });
                  dispatch({ type: 'UPDATE_ACTIVITY', sessionId, activity: { agentId: 'architect', status: 'working', lastLog: log } });
              } else if (log.toLowerCase().includes('code') || log.toLowerCase().includes('writing')) {
                   dispatch({ type: 'UPDATE_ACTIVITY', sessionId, activity: { agentId: 'architect', status: 'success', lastLog: 'Architecture finalized.' } });
                  dispatch({ type: 'UPDATE_ACTIVITY', sessionId, activity: { agentId: 'codegen', status: 'working', lastLog: log } });
              }
          });

          if (!agent.repl) {
              dispatch({ type: 'ADD_MESSAGE', sessionId, message: createAgentMessage("Execution completed successfully.") });
              dispatch({ type: 'SET_STATUS', sessionId, status: 'completed' });
              dispatch({ type: 'SET_ACTIVITIES', sessionId, activities: [
                  { agentId: 'research', agentName: 'PhD Researcher', status: 'success', lastLog: 'Done.' },
                  { agentId: 'architect', agentName: 'Senior Architect', status: 'success', lastLog: 'Done.' },
                  { agentId: 'codegen', agentName: 'Lead Dev', status: 'success', lastLog: 'Done.' }
              ]});
          }
      } catch (err: any) {
          dispatch({ type: 'ADD_MESSAGE', sessionId, message: createAgentMessage(`Error: ${err.message}`) });
          dispatch({ type: 'SET_STATUS', sessionId, status: 'failed' });
          dispatch({ type: 'SET_ACTIVITIES', sessionId, activities: [] });
      }
  };

  const handleSendMessage = async (content: string) => {
    if (!agent) return;

    // REPL Mode: Allow input even if running
    if (session.status === 'running' && !agent.repl) return;

    dispatch({ type: 'ADD_MESSAGE', sessionId: session.id, message: createUserMessage(content) });

    if (content.trim() === '/back') {
        dispatch({ type: 'GO_HOME' });
        return;
    }

    // Interactive Refinement Mode (Legacy)
    if (agent.interactive && !agent.repl && session.status !== 'completed' && session.status !== 'failed') {
        if (session.status === 'idle') {
            const newAnswers = { ...session.answers, intent: content };
            dispatch({ type: 'UPDATE_ANSWERS', sessionId: session.id, answers: newAnswers });
            dispatch({ type: 'SET_STATUS', sessionId: session.id, status: 'refining' });
            
            setTimeout(() => {
                dispatch({ 
                    type: 'ADD_MESSAGE', 
                    sessionId: session.id, 
                    message: createAgentMessage("Understood, CEO. I've analyzed your intent. I'm mobilizing the Research and Architecture teams to prepare a detailed PRD and system design. Should I proceed with the full 'Apple-Level' execution, or do you have specific constraints to add?") 
                });
                
                dispatch({
                    type: 'SET_ACTIVITIES',
                    sessionId: session.id,
                    activities: [
                        { agentId: 'research', agentName: 'PhD Researcher', status: 'thinking', lastLog: 'Analyzing market context...' },
                        { agentId: 'architect', agentName: 'Senior Architect', status: 'idle' },
                        { agentId: 'codegen', agentName: 'Lead Dev', status: 'idle' }
                    ]
                });
            }, 800);
        } else if (session.status === 'refining') {
            if (content.toLowerCase().includes('proceed') || content.toLowerCase().includes('yes') || content.toLowerCase().includes('go')) {
                dispatch({ type: 'SET_STATUS', sessionId: session.id, status: 'running' });
                dispatch({ type: 'ADD_MESSAGE', sessionId: session.id, message: createAgentMessage("Excellent. Commencing execution. You can monitor the team's progress in the Dashboard (Press 'D').") });
                runAgentExecution(session.id, session.answers);
            } else {
                dispatch({ type: 'ADD_MESSAGE', sessionId: session.id, message: createAgentMessage("Noted. Adjusting parameters. Anything else before we start?") });
            }
        }
        return;
    }

    // REPL Mode Execution
    if (agent.repl && session.status === 'running' && agent.onInput) {
        await agent.onInput(content, (log: string) => {
             dispatch({ type: 'ADD_MESSAGE', sessionId: session.id, message: createLogMessage(log) });
        });
        return;
    }

    // Wizard Logic
    const currentStepIndex = Object.keys(session.answers).length;
    if (currentStepIndex < agent.steps.length) {
      const step = agent.steps[currentStepIndex];
      const newAnswers = { ...session.answers, [step.key]: content };
      dispatch({ type: 'UPDATE_ANSWERS', sessionId: session.id, answers: newAnswers });

      const nextStepIndex = currentStepIndex + 1;
      if (nextStepIndex < agent.steps.length) {
        const nextStep = agent.steps[nextStepIndex];
        setTimeout(() => {
           dispatch({ type: 'ADD_MESSAGE', sessionId: session.id, message: createAgentMessage(nextStep.question) });
        }, 300);
      } else {
        dispatch({ type: 'SET_STATUS', sessionId: session.id, status: 'running' });
        setTimeout(() => {
           dispatch({ type: 'ADD_MESSAGE', sessionId: session.id, message: createAgentMessage(agent.repl ? "Session started. Ready for commands." : "All inputs received. Starting execution...") });
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
        placeholder={session.status === 'running' && !agent?.repl ? 'Agent is running...' : 'Type your command...'}
        disabled={session.status === 'running' && !agent?.repl}
      />
    </Box>
  );
};
