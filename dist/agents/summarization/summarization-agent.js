"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummarizationAgent = void 0;
const llm_1 = require("../../src/runtime/llm");
class SummarizationAgent {
    constructor(llm) {
        this.llm = llm || new llm_1.MockLLMProvider();
    }
    async summarize(dossier, sources) {
        const prompt = `
      Please summarize the following research dossier into a human-readable format.

      Company: ${dossier.companySummary}
      Industry: ${dossier.industryOverview}
      Key Risks: ${dossier.risks.join(', ')}
      Opportunities: ${dossier.opportunities.join(', ')}

      Sources Count: ${sources.length}
    `;
        const response = await this.llm.generate(prompt);
        // In a real implementation, we would parse JSON from LLM or use structured output.
        // Here we use the mock response directly.
        return {
            summary: response.content,
            keyInsights: [
                'Research indicates strong market position.',
                'Identified risks are manageable.',
                'Growth opportunities align with strategic goals.'
            ],
            reportDate: new Date().toISOString()
        };
    }
}
exports.SummarizationAgent = SummarizationAgent;
//# sourceMappingURL=summarization-agent.js.map