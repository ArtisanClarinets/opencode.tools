import * as React from 'react';
import { Box } from 'ink';
import { StoreProvider, useStore } from './store/store';
import { HomeScreen } from './screens/HomeScreen';
import { ChatScreen } from './screens/ChatScreen';
import { Header } from './components/Header';

const Main: React.FC = () => {
  const { state } = useStore();

  return (
    <Box flexDirection="column" minHeight={20}>
      <Header />
      {state.view === 'home' ? <HomeScreen /> : <ChatScreen />}
    </Box>
  );
};

export const App: React.FC = () => (
  <StoreProvider>
    <Main />
  </StoreProvider>
);
