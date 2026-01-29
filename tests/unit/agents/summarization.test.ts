import { SummarizationAgent } from '../../../agents/summarization/summarization-agent';
import { MockLLMProvider } from '../../../src/runtime/llm';
import { ResearchDossier, Source } from '../../../agents/research/types';

describe('SummarizationAgent', () => {
  it('should summarize a dossier', async () => {
    const agent = new SummarizationAgent(new MockLLMProvider());
    const dossier: ResearchDossier = {
        companySummary: 'Company X',
        industryOverview: 'Industry Y',
        risks: [],
        opportunities: [],
        competitors: [],
        techStack: {},
        recommendations: []
    };
    const sources: Source[] = [];

    const result = await agent.summarize(dossier, sources);
    expect(result.summary).toBeDefined();
    expect(result.keyInsights.length).toBeGreaterThan(0);
  });
});
