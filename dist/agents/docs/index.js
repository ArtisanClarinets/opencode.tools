"use strict";
// C:\Users\drpt0\iCloudDrive\Developer\Projects\Active\opencode.tools\agents\docs\index.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDocuments = generateDocuments;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Mocks the Documentation Agent which consumes a Research Dossier and a Brief
 * to produce a Product Requirements Document (PRD) and Statement of Work (SOW).
 * @param dossier The structured dossier from the Research Agent.
 * @param brief The original client brief.
 * @returns An object containing the generated PRD and SOW content in Markdown.
 */
async function generateDocuments(dossier, brief) {
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
//# sourceMappingURL=index.js.map