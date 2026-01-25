import { SummarizationAgent } from '../../../agents/summarization/summarization-agent';
import { MockLLMProvider } from '../../../src/runtime/llm';

describe('SummarizationAgent', () => {
  it('should summarize a dossier', async () => {
    const agent = new SummarizationAgent(new MockLLMProvider());
    const dossier = {
        companySummary: 'Company X',
        industryOverview: 'Industry Y',
        risks: [],
        opportunities: [],
        competitors: [],
        techStack: {},
        recommendations: []
    } as any;
    const sources = [] as any;

    const result = await agent.summarize(dossier, sources);
    expect(result.summary).toBeDefined();
    expect(result.keyInsights.length).toBeGreaterThan(0);
  });
});
