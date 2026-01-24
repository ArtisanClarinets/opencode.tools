"use strict";
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
exports.ClientDeliveryWorkflow = void 0;
const path = __importStar(require("path"));
const run_store_1 = require("../runtime/run-store");
const tool_wrapper_1 = require("../runtime/tool-wrapper");
const google_provider_1 = require("../search/google-provider");
const fetcher_1 = require("../search/fetcher");
const store_1 = require("../evidence/store");
const chunker_1 = require("../retrieval/chunker");
const passage_index_1 = require("../retrieval/passage-index");
const claim_extractor_1 = require("../analysis/claim-extractor");
const citation_scorer_1 = require("../analysis/citation-scorer");
const policy_engine_1 = require("../governance/policy-engine");
const revision_loop_1 = require("../review/revision-loop");
const reviewer_1 = require("../review/reviewer");
const exporter_1 = require("../deliverables/exporter");
const research_rubric_1 = require("../governance/rubrics/research-rubric");
class ClientDeliveryWorkflow {
    async run(briefPath) {
        console.log('🚀 Starting Client Delivery Workflow...');
        // 1. Init Runtime
        const runStore = new run_store_1.RunStore();
        const toolWrapper = new tool_wrapper_1.ToolWrapper(runStore);
        const runId = runStore.getContext().runId;
        console.log(`Run ID: ${runId}`);
        // 2. Setup Services
        const searchProvider = new google_provider_1.GoogleSearchProvider(process.env.GOOGLE_API_KEY || '', process.env.GOOGLE_CX || '');
        const fetcher = new fetcher_1.WebFetcher();
        const evidenceStore = new store_1.EvidenceStore(runStore.getArtifactManager());
        const chunker = new chunker_1.Chunker();
        const index = new passage_index_1.PassageIndex();
        const claimExtractor = new claim_extractor_1.ClaimExtractor();
        const citationScorer = new citation_scorer_1.CitationScorer(index);
        const policyEngine = new policy_engine_1.PolicyEngine(runStore);
        policyEngine.registerGate({
            id: 'research-finalize',
            name: 'Research Finalize',
            rubricId: 'research-finalize',
            requiredApprovals: 1, // Auto reviewer
            blocking: true
        });
        const reviewers = [new reviewer_1.AutoReviewer('bot-1', 'methodology')];
        const revisionLoop = new revision_loop_1.RevisionLoop(reviewers, policyEngine);
        const exporter = new exporter_1.Exporter(runStore.getArtifactManager());
        try {
            // 3. Load Brief
            // In real scenario, read from file.
            const brief = { company: 'Acme Corp', industry: 'Widgets' }; // Mock
            // 4. Research Phase
            console.log('🔍 Phase: Research');
            const searchResults = await toolWrapper.execute('search', 'v1', { query: `${brief.company} ${brief.industry}` }, async (args) => {
                return await searchProvider.search(args.query);
            });
            for (const result of searchResults) {
                // Fetch & Store
                const page = await toolWrapper.execute('fetch', 'v1', { url: result.url }, async (args) => {
                    return await fetcher.fetch(args.url);
                });
                const docId = await evidenceStore.add(page);
                // Index
                const passages = chunker.chunk(page.content, docId);
                index.add(passages);
            }
            // 5. Analysis Phase
            console.log('🧠 Phase: Analysis');
            // Mock generating a dossier text from research
            const dossierText = `Acme Corp is a leader in Widgets. They have 50% market share.`;
            const claims = await claimExtractor.extractClaims(dossierText);
            const citationAnalysis = citationScorer.scoreClaims(claims);
            // 6. Review Phase
            console.log('⚖️ Phase: Review');
            const passed = await revisionLoop.runReview('research-finalize', { dossier: dossierText, analysis: citationAnalysis }, research_rubric_1.ResearchRubric);
            if (!passed) {
                throw new Error('Research Gate Failed');
            }
            // 7. Deliverables
            console.log('📦 Phase: Deliverables');
            // Save Dossier
            await runStore.getArtifactManager().store('deliverables/dossier.md', dossierText, 'text/markdown');
            // Export
            const runDir = runStore.getContext().baseDir;
            const zipPath = path.join(runDir, 'delivery-bundle.zip');
            await exporter.zipDirectory(path.join(runDir, 'artifacts'), zipPath);
            console.log(`✅ Workflow Complete. Bundle: ${zipPath}`);
            await runStore.complete();
        }
        catch (error) {
            console.error('❌ Workflow Failed:', error);
            await runStore.fail(error);
            throw error;
        }
    }
}
exports.ClientDeliveryWorkflow = ClientDeliveryWorkflow;
//# sourceMappingURL=client-delivery.js.map