/**
 * D1: Proposal Agent
 * Generates a full client proposal including pricing, timeline, and security appendix.
 */
export declare function generateProposal(inputs: {
    research: any;
    discovery: any;
    qa: any;
    architecture: any;
}): Promise<{
    proposal: string;
    metadata: any;
}>;
/**
 * D3: Proposal peer review
 */
export declare function peerReview(proposal: any, reviewer: 'Delivery' | 'Legal' | 'Technical'): Promise<{
    notes: string;
    score: number;
}>;
/**
 * Exports the final proposal package.
 */
export declare function packageExport(proposalData: any): Promise<{
    packagePath: string;
}>;
//# sourceMappingURL=proposal.d.ts.map