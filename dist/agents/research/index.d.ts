import { ResearchOutput } from './types';
export interface Dossier {
    summary: string;
    competitors: string[];
    constraints: string[];
    opportunities: string[];
    rawSources: string[];
    markdown: string;
}
/**
 * Orchestrates research using the ResearchAgent.
 * @param briefPathOrJson The client brief as a JSON string or path to a JSON file.
 * @returns A structured Research Output.
 */
export declare function gatherDossier(briefPathOrJson: string): Promise<ResearchOutput>;
//# sourceMappingURL=index.d.ts.map