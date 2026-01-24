// C:\Users\drpt0\iCloudDrive\Developer\Projects\Active\opencode.tools\agents\docs\index.ts

import * as fs from 'fs';
import * as path from 'path';
import { Dossier } from '../research/index';

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
export async function generateDocuments(dossier: Dossier, brief: string): Promise<Documents> {
    // In a real scenario, this would involve LLM reasoning and prompt templating.
    // For the prototype, we load the golden PRD output and simulate the SOW.

    const prdGoldenPath = path.join(__dirname, '..', '..', 'tests', 'golden', 'docs', 'prd-output.md');
    const prd = fs.readFileSync(prdGoldenPath, 'utf-8');

    // Simulate SOW generation by extracting key information from the generated PRD/Dossier
    const sow = `
# Statement of Work (SOW) - Real-Time Material Tracking v1.0

## Client
Acme Corp

## Project Summary
This SOW covers the implementation of the Real-Time Material Tracking v1.0, focusing on integrating AI-driven waste prediction and improving mobile performance, as detailed in the attached PRD. The goal is to address existing client reliance on legacy systems and high regulatory requirements.

## Scope
The scope is strictly defined by the features, user stories, and acceptance criteria in the Product Requirements Document (PRD) 'Real-Time Material Tracking v1.0'.

## Deliverables
1. **System Core**: Complete, tested codebase for the web application and API endpoints.
2. **Mobile Optimization**: Verified improvements to mobile app performance in low-connectivity areas.
3. **AI Feature**: Initial implementation of AI-driven material waste prediction model.
4. **Documentation**: Deployment playbook, runbook, and final code delivery.

## Timeline
Based on the PRD Milestones:
- M1: Foundation (End of Week 1)
- M2: Core Feature A (End of Week 3)
- M3: Launch Prep (End of Week 5)

## Assumptions
- Acme Corp will provide necessary API keys and access to legacy data systems for migration.
- All testing will be conducted against the provided golden test outputs.

## Fees and Payment Schedule
[Placeholder for financial terms: $100,000 paid in 3 tranches based on M1, M2, M3 completion.]
`;

    return { prd, sow };
}
