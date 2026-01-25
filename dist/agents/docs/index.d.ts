import { ResearchDossier } from '../research/types';
export interface Documents {
    prd: string;
    sow: string;
}
/**
 * Mocks the Documentation Agent which consumes a Research Dossier and a Brief
 * to produce a Product Requirements Document (PRD) and Statement of Work (SOW).
 * @param dossier The structured dossier from the Research Agent.
 * @param brief The original client brief.
 * @returns An object containing the generated PRD and SOW content in Markdown.
 */
export declare function generateDocuments(dossier: ResearchDossier, brief: string): Promise<Documents>;
//# sourceMappingURL=index.d.ts.map