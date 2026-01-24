export interface ResearchInput {
  brief: ClientBrief;
  keywords?: string[];
  urls?: string[];
  priorNotes?: string;
}

export interface ClientBrief {
  company: string;
  industry: string;
  description: string;
  goals: string[];
  constraints?: string[];
  timeline?: string;
}

export interface ResearchOutput {
  dossier: ResearchDossier;
  sources: Source[];
  meta: ProvenanceMeta;
}

export interface ResearchDossier {
  companySummary: string;
  industryOverview: string;
  competitors: Competitor[];
  techStack: TechStack;
  risks: string[];
  opportunities: string[];
  recommendations: string[];
}

export interface Competitor {
  name: string;
  url: string;
  differentiation: string;
  marketPosition: string;
}

export interface TechStack {
  frontend?: string[];
  backend?: string[];
  infrastructure?: string[];
  thirdParty?: string[];
}

export interface Source {
  url: string;
  title: string;
  relevance: string;
  accessedAt: string;
}

export interface ProvenanceMeta {
  agent: string;
  promptVersion: string;
  mcpVersion: string;
  timestamp: string;
  runId: string;
}