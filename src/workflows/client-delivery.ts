import * as path from 'path';
import { RunStore } from '../runtime/run-store';
import { ToolWrapper } from '../runtime/tool-wrapper';
import { GoogleSearchProvider } from '../search/google-provider';
import { WebFetcher } from '../search/fetcher';
import { EvidenceStore } from '../evidence/store';
import { Chunker } from '../retrieval/chunker';
import { PassageIndex } from '../retrieval/passage-index';
import { ClaimExtractor } from '../analysis/claim-extractor';
import { CitationScorer } from '../analysis/citation-scorer';
import { PolicyEngine } from '../governance/policy-engine';
import { RevisionLoop } from '../review/revision-loop';
import { AutoReviewer } from '../review/reviewer';
import { Exporter } from '../deliverables/exporter';
import { ResearchRubric } from '../governance/rubrics/research-rubric';

export class ClientDeliveryWorkflow {
  async run(briefPath: string) {
    console.log('🚀 Starting Client Delivery Workflow...');
    
    // 1. Init Runtime
    const runStore = new RunStore();
    const toolWrapper = new ToolWrapper(runStore);
    const runId = runStore.getContext().runId;
    console.log(`Run ID: ${runId}`);

    // 2. Setup Services
    const searchProvider = new GoogleSearchProvider(process.env.GOOGLE_API_KEY || '', process.env.GOOGLE_CX || '');
    const fetcher = new WebFetcher();
    const evidenceStore = new EvidenceStore(runStore.getArtifactManager());
    const chunker = new Chunker();
    const index = new PassageIndex();
    const claimExtractor = new ClaimExtractor();
    const citationScorer = new CitationScorer(index);
    
    const policyEngine = new PolicyEngine(runStore);
    policyEngine.registerGate({
      id: 'research-finalize',
      name: 'Research Finalize',
      rubricId: 'research-finalize',
      requiredApprovals: 1, // Auto reviewer
      blocking: true
    });

    const reviewers = [new AutoReviewer('bot-1', 'methodology')];
    const revisionLoop = new RevisionLoop(reviewers, policyEngine);
    const exporter = new Exporter(runStore.getArtifactManager());

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
      const passed = await revisionLoop.runReview('research-finalize', { dossier: dossierText, analysis: citationAnalysis }, ResearchRubric);
      
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

    } catch (error: any) {
      console.error('❌ Workflow Failed:', error);
      await runStore.fail(error);
      throw error;
    }
  }
}
