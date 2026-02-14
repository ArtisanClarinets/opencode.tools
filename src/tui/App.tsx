import * as React from 'react';
import { Box } from 'ink';
import { StoreProvider, useStore } from './store/store';
import { HomeScreen } from './screens/HomeScreen';
import { ChatScreen } from './screens/ChatScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { Header } from './components/Header';
import { useInput } from 'ink';

const Main: React.FC = () => {
  const { state, dispatch } = useStore();

  useInput((input, key) => {
    if (key.escape || input === 'h') {
      dispatch({ type: 'SET_VIEW', view: 'home' });
    }
    if (input === 'd' && state.activeSessionId) {
      dispatch({ type: 'SET_VIEW', view: 'dashboard' });
    }
    if (input === 'c' && state.activeSessionId) {
      dispatch({ type: 'SET_VIEW', view: 'chat' });
    }
  });

  React.useEffect(() => {
    // Auto-start orchestrator session if no sessions exist
    if (state.isLoaded && state.view === 'home' && state.sessions.length === 0) {
      dispatch({ 
        type: 'CREATE_SESSION', 
        agentId: 'orchestrator', 
        agentName: 'Cowork Orchestrator' 
      });
    }
  }, [state.isLoaded, state.sessions.length, state.view, dispatch]);

  const renderScreen = () => {
    switch (state.view) {
      case 'home': return <HomeScreen />;
      case 'chat': return <ChatScreen />;
      case 'dashboard': return <DashboardScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <Box flexDirection="column" minHeight={20}>
      <Header />
      {renderScreen()}
    </Box>
  );
};

export const App: React.FC = () => (
  <StoreProvider>
    <Main />
  </StoreProvider>
);
