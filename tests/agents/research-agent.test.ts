import { ResearchAgent } from '../../agents/research/research-agent';
import { ResearchInput } from '../../agents/research/types';

describe('ResearchAgent', () => {
  let agent: ResearchAgent;

  beforeEach(() => {
    agent = new ResearchAgent();
  });

  describe('execute', () => {
    it('should return a complete research dossier', async () => {
      const input: ResearchInput = {
        brief: {
          company: 'TechCorp',
          industry: 'FinTech',
          description: 'A fintech company specializing in payments',
          goals: ['Increase market share', 'Improve user experience'],
          constraints: ['Regulatory compliance', 'Security requirements'],
          timeline: '6 months'
        },
        keywords: ['fintech', 'payments', 'startup'],
        urls: ['https://techcorp.com'],
        priorNotes: 'Previous research indicates strong growth potential'
      };

      const result = await agent.execute(input);

      expect(result).toBeDefined();
      expect(result.dossier).toBeDefined();
      expect(result.sources).toBeDefined();
      expect(result.meta).toBeDefined();
    });

    it('should include company summary in dossier', async () => {
      const input: ResearchInput = {
        brief: {
          company: 'TechCorp',
          industry: 'FinTech',
          description: 'A fintech company specializing in payments',
          goals: ['Increase market share'],
          timeline: '6 months'
        }
      };

      const result = await agent.execute(input);

      expect(result.dossier.companySummary).toBeDefined();
      expect(result.dossier.companySummary.length).toBeGreaterThan(0);
    });

    it('should include industry overview in dossier', async () => {
      const input: ResearchInput = {
        brief: {
          company: 'TechCorp',
          industry: 'FinTech',
          description: 'A fintech company',
          goals: ['Growth'],
          timeline: '6 months'
        }
      };

      const result = await agent.execute(input);

      expect(result.dossier.industryOverview).toBeDefined();
      expect(result.dossier.industryOverview.length).toBeGreaterThan(0);
    });

    it('should include competitor analysis in dossier', async () => {
      const input: ResearchInput = {
        brief: {
          company: 'TechCorp',
          industry: 'FinTech',
          description: 'A fintech company',
          goals: ['Growth'],
          timeline: '6 months'
        }
      };

      const result = await agent.execute(input);

      expect(result.dossier.competitors).toBeDefined();
      expect(Array.isArray(result.dossier.competitors)).toBe(true);
      expect(result.dossier.competitors.length).toBeGreaterThan(0);
    });

    it('should include tech stack assessment in dossier', async () => {
      const input: ResearchInput = {
        brief: {
          company: 'TechCorp',
          industry: 'FinTech',
          description: 'A fintech company',
          goals: ['Growth'],
          timeline: '6 months'
        }
      };

      const result = await agent.execute(input);

      expect(result.dossier.techStack).toBeDefined();
      expect(result.dossier.techStack.frontend).toBeDefined();
      expect(result.dossier.techStack.backend).toBeDefined();
      expect(result.dossier.techStack.infrastructure).toBeDefined();
      expect(result.dossier.techStack.thirdParty).toBeDefined();
    });

    it('should include risks in dossier', async () => {
      const input: ResearchInput = {
        brief: {
          company: 'TechCorp',
          industry: 'FinTech',
          description: 'A fintech company',
          goals: ['Growth'],
          constraints: ['Regulatory compliance'],
          timeline: '6 months'
        }
      };

      const result = await agent.execute(input);

      expect(result.dossier.risks).toBeDefined();
      expect(Array.isArray(result.dossier.risks)).toBe(true);
      expect(result.dossier.risks.length).toBeGreaterThan(0);
    });

    it('should include opportunities in dossier', async () => {
      const input: ResearchInput = {
        brief: {
          company: 'TechCorp',
          industry: 'FinTech',
          description: 'A fintech company',
          goals: ['Growth', 'Market expansion'],
          timeline: '6 months'
        }
      };

      const result = await agent.execute(input);

      expect(result.dossier.opportunities).toBeDefined();
      expect(Array.isArray(result.dossier.opportunities)).toBe(true);
      expect(result.dossier.opportunities.length).toBeGreaterThan(0);
    });

    it('should include recommendations in dossier', async () => {
      const input: ResearchInput = {
        brief: {
          company: 'TechCorp',
          industry: 'FinTech',
          description: 'A fintech company',
          goals: ['Growth'],
          timeline: '6 months'
        }
      };

      const result = await agent.execute(input);

      expect(result.dossier.recommendations).toBeDefined();
      expect(Array.isArray(result.dossier.recommendations)).toBe(true);
      expect(result.dossier.recommendations.length).toBeGreaterThan(0);
    });

    it('should include sources with required fields', async () => {
      const input: ResearchInput = {
        brief: {
          company: 'TechCorp',
          industry: 'FinTech',
          description: 'A fintech company',
          goals: ['Growth'],
          timeline: '6 months'
        }
      };

      const result = await agent.execute(input);

      expect(result.sources).toBeDefined();
      expect(Array.isArray(result.sources)).toBe(true);
      
      if (result.sources.length > 0) {
        const source = result.sources[0];
        expect(source).toHaveProperty('url');
        expect(source).toHaveProperty('title');
        expect(source).toHaveProperty('relevance');
        expect(source).toHaveProperty('accessedAt');
      }
    });

    it('should include complete metadata', async () => {
      const input: ResearchInput = {
        brief: {
          company: 'TechCorp',
          industry: 'FinTech',
          description: 'A fintech company',
          goals: ['Growth'],
          timeline: '6 months'
        }
      };

      const result = await agent.execute(input);

      expect(result.meta).toBeDefined();
      expect(result.meta).toHaveProperty('agent');
      expect(result.meta).toHaveProperty('promptVersion');
      expect(result.meta).toHaveProperty('mcpVersion');
      expect(result.meta).toHaveProperty('timestamp');
      expect(result.meta).toHaveProperty('runId');
    });

    it('should handle empty input gracefully', async () => {
      const input: ResearchInput = {
        brief: {
          company: '',
          industry: '',
          description: '',
          goals: [],
          timeline: ''
        }
      };

      const result = await agent.execute(input);

      expect(result).toBeDefined();
      expect(result.dossier).toBeDefined();
      expect(result.meta).toBeDefined();
    });
  });
});