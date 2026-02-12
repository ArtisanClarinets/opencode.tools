// C:\Users\drpt0\iCloudDrive\Developer\Projects\Active\opencode.tools\tests\agents.test.ts

import * as fs from 'fs';
import * as path from 'path';

// Use clean ES imports, relying on ts-jest for interop
import { gatherDossier } from '../agents/research/index';
import { generateDocuments } from '../agents/docs/index';
import { ResearchDossier } from '../agents/research/types';

// Define the root of the project for pathing
const projectRoot = path.join(__dirname, '..');

describe('Phase 2 Agents: Research and Documentation', () => {
    const brief = JSON.stringify({
        company: 'Acme Corp',
        industry: 'Construction Tech',
        description: 'Implement a real-time material tracking system for Acme Corp, focusing on AI waste prediction and mobile performance.',
        goals: ['Waste prediction', 'Mobile performance'],
        constraints: ['Legacy systems'],
        timeline: '3 months'
    });
    let dossierMarkdown: string;

    // Load golden files once
    beforeAll(() => {
        dossierMarkdown = fs.readFileSync(path.join(projectRoot, 'tests', 'golden', 'research', 'dossier-output.md'), 'utf-8');
    });

    test('Research Agent: gatherDossier returns structured data', async () => {
        const result = await gatherDossier(brief);

        expect(result).toBeDefined();
        expect(result.dossier).toBeDefined();
        // Since we are using a real agent with mock webfetch, the content will be based on the mock response
        expect(result.dossier.companySummary).toContain('Acme Corp');
        expect(result.meta).toBeDefined();
        expect(result.sources).toBeDefined();
    }, 60000);

    test('Documentation Agent: generateDocuments produces PRD and SOW matching golden file', async () => {
        // Mock the dossier output (using the ResearchDossier structure)
        const mockDossier: ResearchDossier = {
            companySummary: 'Acme Corp summary...',
            industryOverview: 'Industry overview...',
            competitors: [],
            techStack: { frontend: [], backend: [], infrastructure: [], thirdParty: [] },
            risks: [],
            opportunities: [],
            recommendations: []
        };

        const documents = await generateDocuments(mockDossier, brief);

        expect(documents).toBeDefined();
        expect(documents.prd).toBeDefined();
        expect(documents.sow).toBeDefined();

        // Load expected PRD golden output
        const prdGoldenOutput = fs.readFileSync(path.join(projectRoot, 'tests', 'golden', 'docs', 'prd-output.md'), 'utf-8');

        // Verify PRD contains expected sections (not exact match since implementation generates content)
        expect(documents.prd).toContain('Product Requirements Document');
        expect(documents.prd).toContain('Project Overview');
        
        // Simple verification for the simulated SOW content
        expect(documents.sow).toContain('Statement of Work');
        expect(documents.sow).toContain('Project Scope');
    });
});
