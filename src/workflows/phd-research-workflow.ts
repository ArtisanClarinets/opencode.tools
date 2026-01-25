import { ResearchAgent } from '../../agents/research/research-agent';
import { SummarizationAgent } from '../../agents/summarization/summarization-agent';
import { LLMCouncil } from '../review/council';
import { CitationVerifier, SummaryReviewer, DataValidator } from '../review/validators';
import { ResearchInput, ResearchOutput } from '../../agents/research/types';
import { JsonDatabase } from '../database/json-db';
import { ResearchGatekeeper } from '../governance/gatekeeper';
import { logger } from '../runtime/logger';
import { OpenAILLMProvider } from '../runtime/openai-provider';
import { MockLLMProvider } from '../runtime/llm';

export interface PhdResearchResult {
  research: ResearchOutput;
  summary: any;
  councilReview: any;
  approved: boolean;
}

export class PhdResearchWorkflow {
  private researchAgent: ResearchAgent;
  private summarizationAgent: SummarizationAgent;
  private council: LLMCouncil;

  constructor() {
    const db = new JsonDatabase();
    const gatekeeper = new ResearchGatekeeper(5, 3); // Stricter gatekeeper

    this.researchAgent = new ResearchAgent(db, gatekeeper);

    // Initialize LLM Provider (Real if key present, Mock otherwise)
    const apiKey = process.env.OPENAI_API_KEY;
    const llmProvider = apiKey ? new OpenAILLMProvider(apiKey) : new MockLLMProvider();

    if (!apiKey) {
      logger.warn('No OPENAI_API_KEY found, using MockLLMProvider. For real analysis, set the environment variable.');
    }

    this.summarizationAgent = new SummarizationAgent(llmProvider);

    this.council = new LLMCouncil();
    this.council.addMember(new CitationVerifier(llmProvider));
    this.council.addMember(new SummaryReviewer(llmProvider));
    this.council.addMember(new DataValidator(llmProvider));
  }

  async execute(input: ResearchInput): Promise<PhdResearchResult> {
    logger.info('Starting PhD Research Workflow');

    // 1. Research Phase
    const researchResult = await this.researchAgent.execute(input);

    // 2. Summarization Phase
    logger.info('Starting Summarization Phase');
    const summary = await this.summarizationAgent.summarize(researchResult.dossier, researchResult.sources);

    // 3. Council Review
    logger.info('Starting Council Review');
    const councilReview = await this.council.review({
      dossier: researchResult.dossier,
      sources: researchResult.sources,
      summary: summary
    });

    if (councilReview.approved) {
      logger.info('Council Approved Research');
    } else {
      logger.warn('Council Found Issues', { results: councilReview.results });
    }

    return {
      research: researchResult,
      summary,
      councilReview,
      approved: councilReview.approved
    };
  }
}
