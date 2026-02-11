"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentationAgent = void 0;
exports.generateDocuments = generateDocuments;
const logger_1 = require("../../src/runtime/logger");
class DocumentationAgent {
    constructor() {
        this.agentName = 'documentation-agent';
    }
    /**
     * Generates a PRD and SOW based on research findings.
     */
    async generateDocuments(dossier, brief) {
        logger_1.logger.info('Documentation Agent started', { agent: this.agentName, company: dossier.companySummary.split(' ')[0] });
        // Logic to construct a professional PRD
        const prd = this.constructPRD(dossier, brief);
        // Logic to construct a professional SOW
        const sow = this.constructSOW(dossier, brief);
        logger_1.logger.info('Documentation Agent completed', { agent: this.agentName });
        return { prd, sow };
    }
    constructPRD(dossier, brief) {
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
    constructSOW(dossier, brief) {
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
exports.DocumentationAgent = DocumentationAgent;
// Functional wrapper for backward compatibility
async function generateDocuments(dossier, brief) {
    const agent = new DocumentationAgent();
    return agent.generateDocuments(dossier, brief);
}
//# sourceMappingURL=index.js.map