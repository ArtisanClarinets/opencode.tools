import { ResearchDossier } from '../research/types';
export interface Documents {
    prd: string;
    sow: string;
}
export declare class DocumentationAgent {
    private readonly agentName;
    constructor();
    /**
     * Generates a PRD and SOW based on research findings.
     */
    generateDocuments(dossier: ResearchDossier, brief: string): Promise<Documents>;
    private constructPRD;
    private constructSOW;
}
export declare function generateDocuments(dossier: ResearchDossier, brief: string): Promise<Documents>;
//# sourceMappingURL=index.d.ts.map