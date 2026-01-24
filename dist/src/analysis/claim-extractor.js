"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimExtractor = void 0;
class ClaimExtractor {
    // This would typically use an LLM
    // For now, we'll use a heuristic or mock
    async extractClaims(text) {
        // Mock extraction: treat sentences with "is" or "has" as claims
        const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
        const claims = [];
        for (const sent of sentences) {
            if (sent.includes(' is ') || sent.includes(' has ') || sent.includes(' will ')) {
                claims.push({
                    id: `claim-${Math.random().toString(36).substring(7)}`,
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
exports.ClaimExtractor = ClaimExtractor;
//# sourceMappingURL=claim-extractor.js.map