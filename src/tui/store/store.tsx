import * as React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Session, Message, AgentActivity } from '../types';
import { sessionStore } from '../utils/session-store';


export interface State {
  sessions: Session[];
  activeSessionId: string | null;
  view: 'home' | 'chat' | 'dashboard';
  isLoaded: boolean;
}

export type Action =
  | { type: 'LOAD_SESSIONS'; sessions: Session[] }
  | { type: 'CREATE_SESSION'; agentId: string; agentName: string }
  | { type: 'SELECT_SESSION'; sessionId: string }
  | { type: 'UPDATE_SESSION_NAME'; sessionId: string; name: string }
  | { type: 'ADD_MESSAGE'; sessionId: string; message: Message }
  | { type: 'UPDATE_ANSWERS'; sessionId: string; answers: Record<string, any> }
  | { type: 'SET_STATUS'; sessionId: string; status: Session['status'] }
  | { type: 'SET_ACTIVITIES'; sessionId: string; activities: AgentActivity[] }
  | { type: 'UPDATE_ACTIVITY'; sessionId: string; activity: Partial<AgentActivity> & { agentId: string } }
  | { type: 'SET_VIEW'; view: State['view'] }
  | { type: 'GO_HOME' }
  | { type: 'DELETE_SESSION'; sessionId: string };

const initialState: State = {
  sessions: [],
  activeSessionId: null,
  view: 'home',
  isLoaded: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_SESSIONS':
      return { ...state, sessions: action.sessions, isLoaded: true };

    case 'CREATE_SESSION':
      const newSession: Session = {
        id: uuidv4(),
        name: `${action.agentName} ${new Date().toLocaleDateString()}`,
        agentId: action.agentId,
        messages: [],
        answers: {},
        status: 'idle',
        activities: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return {
        ...state,
        sessions: [newSession, ...state.sessions],
        activeSessionId: newSession.id,
        view: 'chat',
      };

    case 'SELECT_SESSION':
      return { ...state, activeSessionId: action.sessionId, view: 'chat' };

    case 'SET_VIEW':
      return { ...state, view: action.view };

    case 'GO_HOME':
      return { ...state, activeSessionId: null, view: 'home' };

    case 'UPDATE_SESSION_NAME':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId ? { ...s, name: action.name, updatedAt: Date.now() } : s
        ),
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId
            ? { ...s, messages: [...s.messages, action.message], updatedAt: Date.now() }
            : s
        ),
      };

    case 'UPDATE_ANSWERS':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId
            ? { ...s, answers: action.answers, updatedAt: Date.now() }
            : s
        ),
      };

    case 'SET_STATUS':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId ? { ...s, status: action.status, updatedAt: Date.now() } : s
        ),
      };

    case 'SET_ACTIVITIES':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId ? { ...s, activities: action.activities, updatedAt: Date.now() } : s
        ),
      };

    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.sessionId
            ? {
                ...s,
                activities: s.activities.map((a) =>
                  a.agentId === action.activity.agentId ? { ...a, ...action.activity } : a
                ),
                updatedAt: Date.now(),
              }
            : s
        ),
      };

    case 'DELETE_SESSION':
      return {
        ...state,
        sessions: state.sessions.filter(s => s.id !== action.sessionId),
        activeSessionId: state.activeSessionId === action.sessionId ? null : state.activeSessionId,
        view: state.activeSessionId === action.sessionId ? 'home' : state.view
      };

    default:
      return state;
  }
}

export const StoreContext = React.createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const StoreProvider: React.FC = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  // Load sessions on mount
  React.useEffect(() => {
    try {
      const index = sessionStore.getIndex();
      const loadedSessions: Session[] = [];
      
      // Load full sessions for the most recent ones
      for (const item of index.slice(0, 20)) {
        const full = sessionStore.loadSession(item.id);
        if (full) {
          loadedSessions.push(full);
        }
      }
      
      dispatch({ type: 'LOAD_SESSIONS', sessions: loadedSessions });
    } catch (err) {
      console.error('Failed to load sessions', err);
    }
  }, []);

  // Save sessions on change
  React.useEffect(() => {
    if (!state.isLoaded) return;
    
    // Save active session if it changed
    if (state.activeSessionId) {
      const active = state.sessions.find(s => s.id === state.activeSessionId);
      if (active) {
        sessionStore.saveSession(active);
      }
    }
    
    // Also handle deletions in index (handled by deleteSession action if we call it)
  }, [state.sessions, state.activeSessionId, state.isLoaded]);

  // Handle deletion sync
  const customDispatch = React.useMemo(() => {
    return (action: Action) => {
      if (action.type === 'DELETE_SESSION') {
        sessionStore.deleteSession(action.sessionId);
      }
      dispatch(action);
    };
  }, [dispatch]);

  return (
    <StoreContext.Provider value={{ state, dispatch: customDispatch as React.Dispatch<Action> }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
