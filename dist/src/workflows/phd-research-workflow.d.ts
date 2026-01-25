import { ResearchInput, ResearchOutput } from '../../agents/research/types';
export interface PhdResearchResult {
    research: ResearchOutput;
    summary: any;
    councilReview: any;
    approved: boolean;
}
export declare class PhdResearchWorkflow {
    private researchAgent;
    private summarizationAgent;
    private council;
    constructor();
    execute(input: ResearchInput): Promise<PhdResearchResult>;
}
//# sourceMappingURL=phd-research-workflow.d.ts.map