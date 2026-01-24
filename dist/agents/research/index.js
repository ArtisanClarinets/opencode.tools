"use strict";
// C:\Users\drpt0\iCloudDrive\Developer\Projects\Active\opencode.tools\agents\research\index.ts
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
exports.gatherDossier = gatherDossier;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Mocks the webfetch tool to return a predefined research dossier for a fictional company 'Acme Corp'.
 * In a real scenario, this would orchestrate multiple webfetch calls based on the brief.
 * @param brief The client brief for the research.
 * @returns A structured Research Dossier.
 */
async function gatherDossier(brief) {
    // In a real implementation, this would involve LLM reasoning and webfetch calls.
    // For the prototype, we load the golden output and parse the content.
    const goldenPath = path.join(__dirname, '..', '..', 'tests', 'golden', 'research', 'dossier-output.md');
    const dossierMarkdown = fs.readFileSync(goldenPath, 'utf-8');
    // Simple parsing logic (simulated for prototype)
    const summary = `Acme Corp is a fictional B2B SaaS company that provides specialized project management tools for the construction industry. Their core product focuses on real-time material tracking and compliance reporting, primarily serving small to mid-sized contractors.`;
    const competitors = ['BuildTools', 'ConstractPro', 'PlanSwift', 'Fieldwire', 'Procore (Enterprise)'];
    const constraints = [
        'Existing client base relies on legacy, on-premise solutions.',
        'High regulatory requirements in target market (compliance is critical).',
        'Mobile app performance in low-connectivity construction zones is a known issue.'
    ];
    const opportunities = [
        'AI-driven material waste prediction to reduce costs.',
        'Integration with drone imaging for site progress monitoring.',
        'Expansion into European regulatory compliance markets.'
    ];
    return {
        summary,
        competitors,
        constraints,
        opportunities,
        rawSources: ['www.acmecorp.com/about', 'www.briefing.com/acme-analysis', 'www.construction-review.org/top-5'],
        markdown: dossierMarkdown,
    };
}
//# sourceMappingURL=index.js.map