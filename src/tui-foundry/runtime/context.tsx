import * as React from 'react';
import { getTuiRuntime, TuiRuntime } from 'src/tui-foundry/runtime/tui-runtime';

const RuntimeContext = React.createContext<TuiRuntime | null>(null);

export const RuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [runtime, setRuntime] = React.useState<TuiRuntime | null>(null);

  React.useEffect(() => {
    getTuiRuntime().then(setRuntime).catch((error: unknown) => {
      console.error('Failed to initialize Foundry runtime', error);
    });
  }, []);

  if (!runtime) {
    return null;
  }

  return <RuntimeContext.Provider value={runtime}>{children}</RuntimeContext.Provider>;
};

export const useRuntime = (): TuiRuntime => {
  const runtime = React.useContext(RuntimeContext);
  if (!runtime) {
    throw new Error('useRuntime must be used inside RuntimeProvider');
  }

  return runtime;
};
