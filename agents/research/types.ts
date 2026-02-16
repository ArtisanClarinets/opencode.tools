import { z } from 'zod';

export const ClientBriefSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  description: z.string().min(1, "Description is required"),
  goals: z.array(z.string()).min(1, "At least one goal is required"),
  constraints: z.array(z.string()).optional(),
  timeline: z.string().optional()
});

export const ResearchInputSchema = z.object({
  brief: ClientBriefSchema,
  keywords: z.array(z.string()).optional(),
  urls: z.array(z.string().url()).optional(),
  priorNotes: z.string().optional()
});

export type ResearchInput = z.infer<typeof ResearchInputSchema>;
export type ClientBrief = z.infer<typeof ClientBriefSchema>;

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
