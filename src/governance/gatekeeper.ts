import { Source } from '../../agents/research/types';

export interface GatekeeperResult {
  passed: boolean;
  score: number;
  reasons: string[];
}

export class ResearchGatekeeper {
  private minSources: number;
  private minDomains: number;

  constructor(minSources: number = 3, minDomains: number = 2) {
    this.minSources = minSources;
    this.minDomains = minDomains;
  }

  evaluate(sources: Source[]): GatekeeperResult {
    const reasons: string[] = [];
    let score = 0;

    // Check count
    if (sources.length >= this.minSources) {
      score += 0.5;
    } else {
      reasons.push(`Insufficient sources: ${sources.length}/${this.minSources}`);
    }

    // Check domain diversity
    const domains = new Set(sources.map(s => {
      try {
        return new URL(s.url).hostname;
      } catch {
        return 'unknown';
      }
    }));

    if (domains.size >= this.minDomains) {
      score += 0.5;
    } else {
      reasons.push(`Insufficient domain diversity: ${domains.size}/${this.minDomains}`);
    }

    const passed = reasons.length === 0;

    return {
      passed,
      score,
      reasons
    };
  }
}
