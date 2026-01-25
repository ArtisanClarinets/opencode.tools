"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhdResearchWorkflow = void 0;
const research_agent_1 = require("../../agents/research/research-agent");
const summarization_agent_1 = require("../../agents/summarization/summarization-agent");
const council_1 = require("../review/council");
const validators_1 = require("../review/validators");
const json_db_1 = require("../database/json-db");
const gatekeeper_1 = require("../governance/gatekeeper");
const logger_1 = require("../runtime/logger");
const openai_provider_1 = require("../runtime/openai-provider");
const llm_1 = require("../runtime/llm");
class PhdResearchWorkflow {
    constructor() {
        const db = new json_db_1.JsonDatabase();
        const gatekeeper = new gatekeeper_1.ResearchGatekeeper(5, 3); // Stricter gatekeeper
        this.researchAgent = new research_agent_1.ResearchAgent(db, gatekeeper);
        // Initialize LLM Provider (Real if key present, Mock otherwise)
        const apiKey = process.env.OPENAI_API_KEY;
        const llmProvider = apiKey ? new openai_provider_1.OpenAILLMProvider(apiKey) : new llm_1.MockLLMProvider();
        if (!apiKey) {
            logger_1.logger.warn('No OPENAI_API_KEY found, using MockLLMProvider. For real analysis, set the environment variable.');
        }
        this.summarizationAgent = new summarization_agent_1.SummarizationAgent(llmProvider);
        this.council = new council_1.LLMCouncil();
        this.council.addMember(new validators_1.CitationVerifier(llmProvider));
        this.council.addMember(new validators_1.SummaryReviewer(llmProvider));
        this.council.addMember(new validators_1.DataValidator(llmProvider));
    }
    async execute(input) {
        logger_1.logger.info('Starting PhD Research Workflow');
        // 1. Research Phase
        const researchResult = await this.researchAgent.execute(input);
        // 2. Summarization Phase
        logger_1.logger.info('Starting Summarization Phase');
        const summary = await this.summarizationAgent.summarize(researchResult.dossier, researchResult.sources);
        // 3. Council Review
        logger_1.logger.info('Starting Council Review');
        const councilReview = await this.council.review({
            dossier: researchResult.dossier,
            sources: researchResult.sources,
            summary: summary
        });
        if (councilReview.approved) {
            logger_1.logger.info('Council Approved Research');
        }
        else {
            logger_1.logger.warn('Council Found Issues', { results: councilReview.results });
        }
        return {
            research: researchResult,
            summary,
            councilReview,
            approved: councilReview.approved
        };
    }
}
exports.PhdResearchWorkflow = PhdResearchWorkflow;
//# sourceMappingURL=phd-research-workflow.js.map