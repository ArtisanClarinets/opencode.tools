import { ProjectStack, ProjectStructure } from './discovery';
export interface ProjectComplexity {
    level: 'low' | 'medium' | 'high' | 'very-high';
    score: number;
    factors: string[];
}
export interface CostEstimate {
    phase: string;
    tasks: {
        name: string;
        hours: number;
        role: string;
    }[];
    totalHours: number;
    cost: number;
}
export interface ProposalInput {
    projectName: string;
    clientName: string;
    stack?: ProjectStack;
    structure?: ProjectStructure;
    discoveryArtifacts?: any[];
    riskItems?: any[];
    requirements?: {
        features?: number;
        integrations?: number;
        dataModels?: number;
        apis?: number;
    };
}
/**
 * Generate proposal document
 */
export declare function generateProposal(inputs: any): Promise<{
    proposal: string;
    metadata: any;
}>;
/**
 * Peer review of proposal
 */
export declare function peerReview(proposal: any, reviewer: 'Delivery' | 'Legal' | 'Technical'): Promise<{
    notes: string;
    score: number;
    recommendations: string[];
}>;
/**
 * Export proposal package
 */
export declare function packageExport(proposalData: {
    proposal: string;
    metadata: any;
}): Promise<{
    packagePath: string;
    files: string[];
}>;
//# sourceMappingURL=proposal.d.ts.map