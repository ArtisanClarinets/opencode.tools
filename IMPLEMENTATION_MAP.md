# Implementation Map

## Runtime Spine
- **Run Store**: [run-store.ts](src/runtime/run-store.ts)
- **Artifacts**: [artifacts.ts](src/runtime/artifacts.ts)
- **Audit**: [audit.ts](src/runtime/audit.ts)
- **Tool Wrapper**: [tool-wrapper.ts](src/runtime/tool-wrapper.ts)
- **Replay/Cache**: [replay.ts](src/runtime/replay.ts), [cache.ts](src/runtime/cache.ts)
- **Types**: [run.ts](src/types/run.ts)

## Security
- **Secrets**: [secrets.ts](src/security/secrets.ts)
- **Redaction**: [redaction.ts](src/security/redaction.ts)

## Governance
- **Policy Engine**: [policy-engine.ts](src/governance/policy-engine.ts)
- **Rubrics**: [rubric.ts](src/governance/rubric.ts), [research-rubric.ts](src/governance/rubrics/research-rubric.ts)
- **Types**: [review.ts](src/types/review.ts)

## Web/Search/Evidence
- **Search Provider**: [types.ts](src/search/types.ts), [google-provider.ts](src/search/google-provider.ts)
- **Fetcher**: [fetcher.ts](src/search/fetcher.ts)
- **Evidence Store**: [store.ts](src/evidence/store.ts)

## Retrieval & Analysis
- **Chunker**: [chunker.ts](src/retrieval/chunker.ts)
- **Passage Index**: [passage-index.ts](src/retrieval/passage-index.ts)
- **Claim Extractor**: [claim-extractor.ts](src/analysis/claim-extractor.ts)
- **Citation Scorer**: [citation-scorer.ts](src/analysis/citation-scorer.ts)

## Review
- **Reviewer**: [reviewer.ts](src/review/reviewer.ts)
- **Revision Loop**: [revision-loop.ts](src/review/revision-loop.ts)

## Deliverables
- **Exporter**: [exporter.ts](src/deliverables/exporter.ts)

## Workflows
- **Client Delivery**: [client-delivery.ts](src/workflows/client-delivery.ts)

## Scripts
- **Verification**: [verify-full-system.ts](scripts/verify-full-system.ts)
- **Run**: [run-delivery.ts](scripts/run-delivery.ts)

## Tool IDs
- `search`
- `fetch`
