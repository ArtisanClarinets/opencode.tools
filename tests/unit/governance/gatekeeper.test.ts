import { ResearchGatekeeper } from '../../../src/governance/gatekeeper';

describe('ResearchGatekeeper', () => {
  let gatekeeper: ResearchGatekeeper;

  beforeEach(() => {
    gatekeeper = new ResearchGatekeeper(3, 2);
  });

  it('should pass when sources and domains are sufficient', () => {
    const sources = [
      { url: 'https://example.com/1', title: '1', relevance: 'High', accessedAt: 'now' },
      { url: 'https://example.com/2', title: '2', relevance: 'High', accessedAt: 'now' },
      { url: 'https://other.com/1', title: '3', relevance: 'High', accessedAt: 'now' }
    ];

    const result = gatekeeper.evaluate(sources);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(1.0);
  });

  it('should fail when sources are insufficient', () => {
    const sources = [
      { url: 'https://example.com/1', title: '1', relevance: 'High', accessedAt: 'now' }
    ];

    const result = gatekeeper.evaluate(sources);
    expect(result.passed).toBe(false);
    expect(result.reasons.some(r => r.includes('Insufficient sources'))).toBe(true);
  });

  it('should fail when domain diversity is insufficient', () => {
    const sources = [
      { url: 'https://example.com/1', title: '1', relevance: 'High', accessedAt: 'now' },
      { url: 'https://example.com/2', title: '2', relevance: 'High', accessedAt: 'now' },
      { url: 'https://example.com/3', title: '3', relevance: 'High', accessedAt: 'now' }
    ];

    const result = gatekeeper.evaluate(sources);
    expect(result.passed).toBe(false);
    expect(result.reasons.some(r => r.includes('Insufficient domain diversity'))).toBe(true);
  });
});
