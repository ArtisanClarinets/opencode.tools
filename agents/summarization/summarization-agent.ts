import { ResearchDossier, Source } from '../research/types';
import { LLMProvider, MockLLMProvider } from '../../src/runtime/llm';

export interface SummarizationOutput {
  summary: string;
  keyInsights: string[];
  reportDate: string;
}

export class SummarizationAgent {
  private llm: LLMProvider;

  constructor(llm?: LLMProvider) {
    this.llm = llm || new MockLLMProvider();
  }

  async summarize(dossier: ResearchDossier, sources: Source[]): Promise<SummarizationOutput> {
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
