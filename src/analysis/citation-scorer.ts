import { Claim, EvidencePassage, CitationAnalysis } from '../types/research';
import { PassageIndex } from '../retrieval/passage-index';

export class CitationScorer {
  private index: PassageIndex;

  constructor(index: PassageIndex) {
    this.index = index;
  }

  scoreClaims(claims: Claim[]): CitationAnalysis {
    let supported = 0;
    const unsupported: Claim[] = [];

    for (const claim of claims) {
      // Try to find evidence in the index
      const matches = this.index.search(claim.text, 3);
      
      if (matches.length > 0) {
        // Attach evidence
        claim.evidence = matches.map(m => ({
          sourceUrl: m.docId, // Ideally this maps back to URL
          text: m.text,
          textOffset: m.offset,
          confidenceScore: 0.8 // Mock confidence
        }));
        supported++;
      } else {
        unsupported.push(claim);
      }
    }

    return {
      totalClaims: claims.length,
      supportedClaims: supported,
      unsupportedClaims: unsupported,
      consensusSummary: [],
      weakSources: []
    };
  }
}
