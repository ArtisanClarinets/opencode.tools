// src/types/research.ts

/**
 * Interface for a normalized source document.
 * This is the output of the source-normalize tool.
 */
export interface Source {
    url: string;
    canonicalUrl: string;
    contentHash: string;
    domainAuthorityScore: number; // Heuristic: 0.0 to 1.0
    recencyScore: number;         // Heuristic: 0.0 (old) to 1.0 (new)
    isPrimarySource: boolean;     // True if original research/report
}

/**
 * Interface for a passage of evidence from a source, linked to a Claim.
 */
export interface EvidencePassage {
    sourceUrl: string;
    text: string;           // Short, direct quote or passage
    textOffset: number;     // Character offset from start of source content
    confidenceScore: number; // How strongly this passage supports the claim (0.0 to 1.0)
}

/**
 * Interface for a single, non-trivial factual claim extracted from evidence.
 */
export interface Claim {
    id: string;
    text: string;               // The synthesized, canonical claim text
    sentiment: 'positive' | 'negative' | 'neutral';
    confidenceLabel: 'high' | 'medium' | 'low'; // Consensus/Contradiction analysis (B3)
    evidence: EvidencePassage[]; // List of passages supporting this claim
    contradictions: EvidencePassage[]; // List of passages refuting this claim
}

/**
 * The full Claims Graph structure for synthesis.
 */
export interface ClaimsGraph {
    questions: string[];
    hypotheses: { text: string; status: 'confirmed' | 'refuted' | 'partial' }[];
    claims: Claim[];
    unsupportedClaims: Claim[]; // Claims that failed the 'citation required' check
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
    weakSources: Source[]; // Sources flagged by quality heuristics
}
