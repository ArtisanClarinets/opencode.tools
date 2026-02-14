export interface AgentStep {
  key: string;
  question: string;
  type: 'text' | 'select' | 'confirm';
  options?: { label: string; value: string }[];
  required?: boolean;
}

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  steps: AgentStep[];
  execute: (answers: Record<string, any>, log: (msg: string) => void) => Promise<any>;
}

export interface Message {
  id: string;
  role: 'user' | 'agent' | 'system' | 'log';
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  name: string;
  agentId: string;
  messages: Message[];
  answers: Record<string, any>;
  status: 'idle' | 'running' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
}
