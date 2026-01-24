"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plan = plan;
exports.gather = gather;
exports.extractClaims = extractClaims;
exports.analyzeCitations = analyzeCitations;
exports.peerReview = peerReview;
exports.finalizeDossier = finalizeDossier;
const audit_1 = require("./audit"); // Assuming relative path for stub tools
const source_normalize_1 = require("./source-normalize");
const RUN_ID = 'mock-run-123'; // Hardcoded for stub purposes
/**
 * PhD-level Research Agent Tool Suite
 */
// B1: Evidence-first research architecture
async function plan(brief) {
    // Advanced Logic Stub: Use LLM to decompose the brief into granular, verifiable questions.
    const questions = [
        "What is the primary market share of the client's top competitor?",
        "What are the major regulatory constraints (e.g., HIPAA, GDPR) applicable to the project domain?",
        "What evidence is required to confirm the 'build vs buy' hypothesis for the authentication system?"
    ];
    const hypotheses = [
        "The current competitor advantage is based on pricing, not feature set.",
        "A COTS authentication solution is faster and cheaper than a custom build."
    ];
    await (0, audit_1.logToolCall)(RUN_ID, 'research.plan', { brief }, { questions, hypotheses });
    return { questions, hypotheses };
}
async function gather(query, sources) {
    // Stub: This function would coordinate webfetch/search, rate-limit, and source-normalize.
    console.log(`[Research.gather] Executing complex search plan for: ${query}. Tracing all fetches.`);
    const normalizedEvidence = [];
    for (const s of sources) {
        // Step 1: Simulated webfetch + audit
        const rawContent = `<html>Raw HTML content from ${s.url} containing claims related to ${query}. The source claims Competitor X has 45% market share.</html>`;
        await (0, audit_1.logToolCall)(RUN_ID, 'webfetch', { url: s.url }, { rawContent: rawContent.substring(0, 50) + '...' });
        // Step 2: Source Normalization (A5)
        const normalizeResult = await (0, source_normalize_1.normalizeSource)(rawContent, s.url);
        const normalizedData = JSON.parse(normalizeResult.content);
        // Simulated Source creation based on normalized data
        const source = {
            url: s.url,
            canonicalUrl: normalizedData.canonicalUrl,
            contentHash: normalizedData.contentHash,
            domainAuthorityScore: s.url.includes('gov') ? 0.9 : 0.5,
            recencyScore: 0.9,
            isPrimarySource: s.url.includes('report')
        };
        normalizedEvidence.push({ source, content: normalizedData.cleanText });
    }
    await (0, audit_1.logToolCall)(RUN_ID, 'research.gather', { query, sources: sources.map(s => s.url) }, { count: normalizedEvidence.length });
    return { normalizedEvidence };
}
// B1: Claim graph
async function extractClaims(normalizedEvidence, originalQuestions) {
    // PhD-Level Logic Stub:
    // 1. Chunking and embedding of normalized content.
    // 2. Semantic clustering of passages to find recurring themes (potential claims).
    // 3. Extractive summarization to generate canonical claim text.
    // 4. Traceability: Each Claim MUST attach to at least one EvidencePassage.
    const claims = [];
    const evidencePassages = [{
            sourceUrl: normalizedEvidence[0].source.url,
            text: 'The market share of Competitor X is 45%, a strong consensus view, verified by official reports.',
            textOffset: 100,
            confidenceScore: 0.95
        }];
    claims.push({
        id: 'claim-1',
        text: 'Competitor X holds a 45% market share in the target industry.',
        sentiment: 'neutral',
        confidenceLabel: 'high',
        evidence: evidencePassages,
        contradictions: []
    });
    // Enforcement: The 'Synthesis' step (finalizeDossier) is STRICTLY LIMITED to claims in this graph.
    await (0, audit_1.logToolCall)(RUN_ID, 'research.claims.extract', { evidenceCount: normalizedEvidence.length }, { claimCount: claims.length });
    return {
        questions: originalQuestions,
        hypotheses: [{ text: "Hypothesis A", status: 'confirmed' }],
        claims: claims,
        unsupportedClaims: []
    };
}
// B2, B3: Citation correctness, Contradiction + consensus analysis
async function analyzeCitations(claimsGraph) {
    // PhD-Level Logic Stub:
    // 1. Contradiction/Consensus: Rerank claims based on opposing evidence. Use an LLM to compare semantically clustered evidence passages to detect refutation/support.
    // 2. Citation Quality: Check Primary/Secondary, Recency, and Domain Authority.
    const analysis = {
        totalClaims: claimsGraph.claims.length,
        supportedClaims: claimsGraph.claims.length,
        unsupportedClaims: [],
        consensusSummary: [],
        weakSources: []
    };
    const sourceMap = new Map();
    claimsGraph.claims.forEach(c => c.evidence.forEach(e => {
        // In a real flow, Source metadata would be retrieved from a database/cache here
        if (!sourceMap.has(e.sourceUrl)) {
            sourceMap.set(e.sourceUrl, {
                url: e.sourceUrl,
                canonicalUrl: e.sourceUrl.toLowerCase(),
                contentHash: 'mock-hash-1',
                domainAuthorityScore: e.sourceUrl.includes('gov') ? 0.9 : 0.3,
                recencyScore: 0.8,
                isPrimarySource: e.sourceUrl.includes('report')
            });
        }
    }));
    for (const claim of claimsGraph.claims) {
        // --- Citation Required Enforcement (G1) ---
        if (claim.evidence.length === 0) {
            analysis.unsupportedClaims.push(claim);
            continue;
        }
        // --- Contradiction & Consensus Analysis (B3) ---
        if (claim.contradictions.length > 0) {
            claim.confidenceLabel = 'low';
            analysis.consensusSummary.push({
                claimId: claim.id,
                consensusView: claim.text,
                minorityView: `Conflicting evidence found in ${claim.contradictions[0].sourceUrl}`
            });
        }
        else if (claim.evidence.length === 1) {
            // Single source = medium confidence unless source is a high-authority primary source
            claim.confidenceLabel = 'medium';
        }
        else {
            claim.confidenceLabel = 'high';
        }
        // --- Citation Quality Scoring (B2) ---
        claim.evidence.forEach(e => {
            const source = sourceMap.get(e.sourceUrl);
            if (source && source.domainAuthorityScore < 0.5 && !source.isPrimarySource) {
                analysis.weakSources.push(source);
            }
        });
    }
    await (0, audit_1.logToolCall)(RUN_ID, 'research.citations.analyze', { totalClaims: claimsGraph.claims.length }, { unsupportedCount: analysis.unsupportedClaims.length, weakSourceCount: analysis.weakSources.length });
    return analysis;
}
// B4: Peer review system
async function peerReview(dossier, reviewer) {
    // Advanced Logic Stub: Simulates a structured review process.
    let notes = `Review by ${reviewer} complete.`;
    let rubricScore = 0;
    let requiredRevisions = [];
    switch (reviewer) {
        case 'Methodology':
            notes = "Checked alignment with initial plan. Coverage is good, but pricing angle is weak.";
            rubricScore = 4;
            requiredRevisions = ["Expand search to include 'competitor X pricing strategy' for better coverage."];
            break;
        case 'Citation':
            notes = "All claims have evidence. Weak sources flagged for follow-up, but no outright unsupported claims.";
            rubricScore = 5;
            break;
        case 'Adversarial':
            notes = "Attempted to falsify Claim 1 by searching for 'Competitor X market share decline' - no refuting evidence found. Conclusion is robust.";
            rubricScore = 5;
            break;
        case 'ExecutiveEditor':
            notes = "Dossier structure is clear, concise, and actionable. Ready for final client review. Must ensure delivery of 'recommendedDiscoveryQuestions'.";
            rubricScore = 5;
            break;
    }
    await (0, audit_1.logToolCall)(RUN_ID, 'research.peer_review', { reviewer }, { rubricScore, revisionCount: requiredRevisions.length });
    return { notes, rubricScore, requiredRevisions };
}
// B5: Research deliverables
async function finalizeDossier(claimGraph, analysis) {
    // Synthesis Stub: Dossier written *only* from the ClaimsGraph and Analysis results. (B1: Evidence-first enforcement)
    // Check G1 policy gate: No unsupported claims allowed.
    if (analysis.unsupportedClaims.length > 0) {
        throw new Error("G1 Policy Violation: Dossier cannot be finalized with unsupported claims.");
    }
    const dossier = `# Research Dossier: Project X Findings (Final Version)\n\n## Key Findings (Derived from Claims Graph)\n\n*   **Claim 1:** ${claimGraph.claims[0].text} (Confidence: ${claimGraph.claims[0].confidenceLabel}).\n\n## Conclusion\n\n-   Confidence is HIGH. All claims supported. Governance check passed.\n`;
    const deliverables = {
        competitorMatrix: { /* ... */},
        pricingInference: { model: 'TBD', clearlyLabeled: 'INFERENCE' },
        regulatoryMemo: { HIPAA: 'Low relevance', PCI: 'High relevance' },
        recommendedDiscoveryQuestions: ["Is the 45% market share based on revenue or user count?"],
    };
    await (0, audit_1.logToolCall)(RUN_ID, 'research.dossier.finalize', { status: 'Success' }, { dossierHash: 'dossier-hash-xyz' });
    return { dossier, deliverables };
}
//# sourceMappingURL=research.js.map