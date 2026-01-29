import { Claim } from '../types/research';
import * as crypto from 'crypto';

export class ClaimExtractor {
  // This would typically use an LLM
  // For now, we'll use a heuristic or mock

  async extractClaims(text: string): Promise<Claim[]> {
    // Mock extraction: treat sentences with "is" or "has" as claims
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
    const claims: Claim[] = [];

    for (const sent of sentences) {
      if (sent.includes(' is ') || sent.includes(' has ') || sent.includes(' will ')) {
        claims.push({
          id: `claim-${crypto.randomUUID().substring(0, 8)}`,
          text: sent,
          sentiment: 'neutral',
          confidenceLabel: 'medium',
          evidence: [],
          contradictions: []
        });
      }
    }
    return claims;
  }
}
