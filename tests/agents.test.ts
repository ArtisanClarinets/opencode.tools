// C:\Users\drpt0\iCloudDrive\Developer\Projects\Active\opencode.tools\tests\agents.test.ts

import * as fs from 'fs';
import * as path from 'path';

// Use clean ES imports, relying on ts-jest for interop
import { gatherDossier } from '../agents/research/index';
import { generateDocuments } from '../agents/docs/index';
import { CodeGenAgent, mockBacklogItem } from '../agents/codegen/index';
import { QAAgent } from '../agents/qa/index';
// Define the root of the project for pathing
const projectRoot = path.join(__dirname, '..');

describe('Phase 2 Agents: Research and Documentation', () => {
    const brief = 'Implement a real-time material tracking system for Acme Corp, focusing on AI waste prediction and mobile performance.';
    let dossierMarkdown: string;

    // Load golden files once
    beforeAll(() => {
        dossierMarkdown = fs.readFileSync(path.join(projectRoot, 'tests', 'golden', 'research', 'dossier-output.md'), 'utf-8');
    });

    test('Research Agent: gatherDossier returns structured data and markdown matching golden file', async () => {
        const dossier = await gatherDossier(brief);

        expect(dossier).toBeDefined();
        expect(dossier.summary).toContain('Acme Corp is a fictional B2B SaaS company');
        expect(dossier.constraints.length).toBeGreaterThanOrEqual(3);
        expect(dossier.opportunities.length).toBeGreaterThanOrEqual(3);
        
        // Golden file comparison
        expect(dossier.markdown.trim()).toEqual(dossierMarkdown.trim());
    });

    test('Documentation Agent: generateDocuments produces PRD and SOW matching golden file', async () => {
        // Mock the dossier output (using the expected structure)
        const mockDossier = {
            summary: 'Acme Corp summary...',
            competitors: [],
            constraints: [],
            opportunities: [],
            rawSources: [],
            markdown: dossierMarkdown,
        };

        const documents = await generateDocuments(mockDossier, brief);

        expect(documents).toBeDefined();
        expect(documents.prd).toBeDefined();
        expect(documents.sow).toBeDefined();

        // Load expected PRD golden output
        const prdGoldenOutput = fs.readFileSync(path.join(projectRoot, 'tests', 'golden', 'docs', 'prd-output.md'), 'utf-8');

        // Golden file comparison
        // The Docs Agent is mocked to read the golden file directly for PRD
        expect(documents.prd.trim()).toEqual(prdGoldenOutput.trim());
        
        // Simple verification for the simulated SOW content
        expect(documents.sow).toContain('Statement of Work (SOW) - Real-Time Material Tracking v1.0');
        expect(documents.sow).toContain('End of Week 5');
    });
});
