// tools/proposal.ts
import { logToolCall } from './audit';

const RUN_ID = 'mock-run-123';

/**
 * D1: Proposal Agent
 * Generates a full client proposal including pricing, timeline, and security appendix.
 */
export async function generateProposal(inputs: {
    research: any;
    discovery: any;
    qa: any;
    architecture: any;
}): Promise<{ proposal: string; metadata: any }> {
    console.log("[Proposal.generate] Generating 'Apple-level' proposal with full traceability appendix.");
    
    // Logic: Synthesize all inputs into a branded, executive-ready document.
    const proposal = `# Client Proposal\n\n## 1. Value Proposition\n\nAddressing pain points identified in discovery...\n\n## 2. Technical Approach\n\nUsing the architecture proposed: ${inputs.architecture.result}\n\n## 3. Quality & Risk\n\nMitigating risks identified in the QA risk matrix.\n\n## 4. Pricing & Timeline\n\n- Fixed Price: $XX,XXX\n- Timeline: 8 weeks`;

    const metadata = {
        traceability: {
            deliverable_1: 'acceptance_criteria_1',
            test_plan: 'tc-1',
            risk: 'risk-1'
        },
        assumptions: ["Assumption 1"],
        exclusions: ["Exclusion 1"],
        securityAppendix: true
    };

    await logToolCall(RUN_ID, 'proposal.generate', { input_types: Object.keys(inputs) }, { proposal_length: proposal.length });
    return { proposal, metadata };
}

/**
 * D3: Proposal peer review
 */
export async function peerReview(proposal: any, reviewer: 'Delivery' | 'Legal' | 'Technical'): Promise<{ notes: string; score: number }> {
    let notes = `Proposal reviewed by ${reviewer}.`;
    let score = 5;

    if (reviewer === 'Legal') {
        notes += " Assumptions and IP terms are clearly defined.";
    }

    await logToolCall(RUN_ID, 'proposal.peer_review', { reviewer }, { score });
    return { notes, score };
}

/**
 * Exports the final proposal package.
 */
export async function packageExport(proposalData: any): Promise<{ packagePath: string }> {
    console.log("[Proposal.package.export] Packaging PDF, MD, and appendices.");
    const packagePath = `artifacts/client/proposal_${Date.now()}.zip`;
    
    await logToolCall(RUN_ID, 'proposal.package.export', { proposal_id: 'prop-1' }, { packagePath });
    return { packagePath };
}
