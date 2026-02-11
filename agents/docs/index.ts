import { logger } from '../../src/runtime/logger';
import { ResearchDossier } from '../research/types';

export interface Documents {
    prd: string;
    sow: string;
}

export class DocumentationAgent {
    private readonly agentName = 'documentation-agent';

    constructor() {}

    /**
     * Generates a PRD and SOW based on research findings.
     */
    public async generateDocuments(dossier: ResearchDossier, brief: string): Promise<Documents> {
        logger.info('Documentation Agent started', { agent: this.agentName, company: dossier.companySummary.split(' ')[0] });

        // Logic to construct a professional PRD
        const prd = this.constructPRD(dossier, brief);
        
        // Logic to construct a professional SOW
        const sow = this.constructSOW(dossier, brief);

        logger.info('Documentation Agent completed', { agent: this.agentName });

        return { prd, sow };
    }

    private constructPRD(dossier: ResearchDossier, brief: string): string {
        return `
# Product Requirements Document (PRD)

## Project Overview
${dossier.companySummary}

## Industry Analysis
${dossier.industryOverview}

## Target Competitors
${dossier.competitors.map(c => `- ${c.name}: ${c.differentiation}`).join('\n')}

## Proposed Tech Stack
- Frontend: ${dossier.techStack.frontend?.join(', ') || 'TBD'}
- Backend: ${dossier.techStack.backend?.join(', ') || 'TBD'}
- Infrastructure: ${dossier.techStack.infrastructure?.join(', ') || 'TBD'}

## Risks and Mitigations
${dossier.risks.map(r => `- ${r}`).join('\n')}

## Strategic Recommendations
${dossier.recommendations.map(rec => `- ${rec}`).join('\n')}
`;
    }

    private constructSOW(dossier: ResearchDossier, brief: string): string {
        return `
# Statement of Work (SOW)

## Project Scope
Implementation of a strategic solution based on the requirements identified in the PRD for ${brief.substring(0, 50)}...

## Deliverables
1. Professional Research Dossier
2. System Architecture Design
3. Full Technical Specification (PRD)
4. Functional Project Prototype

## Timeline
Estimated delivery: 8-12 weeks from project kickoff.
`;
    }
}

// Functional wrapper for backward compatibility
export async function generateDocuments(dossier: ResearchDossier, brief: string): Promise<Documents> {
    const agent = new DocumentationAgent();
    return agent.generateDocuments(dossier, brief);
}
