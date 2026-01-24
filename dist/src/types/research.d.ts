/**
 * Interface for a normalized source document.
 * This is the output of the source-normalize tool.
 */
export interface Source {
    url: string;
    canonicalUrl: string;
    contentHash: string;
    domainAuthorityScore: number;
    recencyScore: number;
    isPrimarySource: boolean;
}
/**
 * Interface for a passage of evidence from a source, linked to a Claim.
 */
export interface EvidencePassage {
    sourceUrl: string;
    text: string;
    textOffset: number;
    confidenceScore: number;
}
/**
 * Interface for a single, non-trivial factual claim extracted from evidence.
 */
export interface Claim {
    id: string;
    text: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidenceLabel: 'high' | 'medium' | 'low';
    evidence: EvidencePassage[];
    contradictions: EvidencePassage[];
}
/**
 * The full Claims Graph structure for synthesis.
 */
export interface ClaimsGraph {
    questions: string[];
    hypotheses: {
        text: string;
        status: 'confirmed' | 'refuted' | 'partial';
    }[];
    claims: Claim[];
    unsupportedClaims: Claim[];
}
/**
 * Interface for the output of citation quality scoring.
 */
export interface CitationAnalysis {
    totalClaims: number;
    supportedClaims: number;
    unsupportedClaims: Claim[];
    consensusSummary: {
        claimId: string;
        consensusView: string;
        minorityView: string;
    }[];
    weakSources: Source[];
}
//# sourceMappingURL=research.d.ts.map