import { Claim, CitationAnalysis } from '../types/research';
import { PassageIndex } from '../retrieval/passage-index';
export declare class CitationScorer {
    private index;
    constructor(index: PassageIndex);
    scoreClaims(claims: Claim[]): CitationAnalysis;
}
//# sourceMappingURL=citation-scorer.d.ts.map