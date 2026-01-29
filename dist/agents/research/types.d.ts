import { z } from 'zod';
export declare const ClientBriefSchema: z.ZodObject<{
    company: z.ZodString;
    industry: z.ZodString;
    description: z.ZodString;
    goals: z.ZodArray<z.ZodString>;
    constraints: z.ZodOptional<z.ZodArray<z.ZodString>>;
    timeline: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ResearchInputSchema: z.ZodObject<{
    brief: z.ZodObject<{
        company: z.ZodString;
        industry: z.ZodString;
        description: z.ZodString;
        goals: z.ZodArray<z.ZodString>;
        constraints: z.ZodOptional<z.ZodArray<z.ZodString>>;
        timeline: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    keywords: z.ZodOptional<z.ZodArray<z.ZodString>>;
    urls: z.ZodOptional<z.ZodArray<z.ZodString>>;
    priorNotes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
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
//# sourceMappingURL=types.d.ts.map