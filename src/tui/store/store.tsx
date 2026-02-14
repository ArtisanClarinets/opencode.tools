import * as React from 'react';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Session, Message } from '../types';

const DATA_DIR = path.join(process.env.HOME || process.cwd(), '.opencode-tools');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    // ignore
  }
}

export interface State {
  sessions: Session[];
  activeSessionId: string | null;
  view: 'home' | 'chat';
}

export type Action =
  | { type: 'LOAD_SESSIONS'; sessions: Session[] }
  | { type: 'CREATE_SESSION'; agentId: string; agentName: string }
  | { type: 'SELECT_SESSION'; sessionId: string }
  | { type: 'UPDATE_SESSION_NAME'; sessionId: string; name: string }
  | { type: 'ADD_MESSAGE'; sessionId: string; message: Message }
  | { type: 'UPDATE_ANSWERS'; sessionId: string; answers: Record<string, any> }
  | { type: 'SET_STATUS'; sessionId: string; status: Session['status'] }
  | { type: 'GO_HOME' }
  | { type: 'DELETE_SESSION'; sessionId: string };

const initialState: State = {
  sessions: [],
  activeSessionId: null,
  view: 'home',
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOAD_SESSIONS':
      return { ...state, sessions: action.sessions };

    case 'CREATE_SESSION':
      const newSession: Session = {
        id: uuidv4(),
        name: `${action.agentName} Chat`,
        agentId: action.agentId,
        messages: [],
        answers: {},
        status: 'idle',
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
      if (fs.existsSync(SESSIONS_FILE)) {
        const data = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        const sessions = JSON.parse(data);
        if (Array.isArray(sessions)) {
            dispatch({ type: 'LOAD_SESSIONS', sessions });
        }
      }
    } catch (err) {
      // ignore
    }
  }, []);

  // Save sessions on change
  React.useEffect(() => {
    try {
        if (state.sessions.length >= 0) { // Save even if empty to handle deletes
            fs.writeFileSync(SESSIONS_FILE, JSON.stringify(state.sessions, null, 2));
        }
    } catch (err) {
        // ignore
    }
  }, [state.sessions]);

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
