# AGENTS.md - OpenCode Tools Developer Guide

This guide defines practical standards for contributors and coding agents working in this repository.

## 1) Engineering Principles

- Build for deterministic, traceable execution.
- Prefer real integrations over placeholders.
- Keep security and governance controls explicit and testable.
- Treat docs as operational contracts: update docs with behavior changes.

## 2) Runtime Topology

- CLI entry: `src/cli.ts`
- TUI entry: `src/tui-app.ts`
- Foundry orchestration: `src/foundry/*`
- Cowork runtime and plugin system: `src/cowork/*`
- Agent implementations: `agents/*`
- MCP server and tool adapters: `tools/*`

When changing orchestration behavior, validate the full flow from entrypoint to runtime to agent/tool execution.

## 3) Required Commands

## Build and quality

```bash
npm run build
npm run lint
npx tsc --noEmit
```

## Testing

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:security
npm run test:all
```

## Full validation

```bash
npm run validate
```

## Interactive runtime

```bash
npm run tui
```

## 4) Coding Standards

## TypeScript

- `strict: true` is enabled in `tsconfig.json`.
- Public methods should have explicit return types.
- Use schema-driven parsing (`zod`) for untrusted input.
- Avoid introducing new `any` where practical; use typed contracts.

## Imports

- Existing code uses mixed styles (absolute aliases and relative imports).
- For new modules, prefer stable import paths and avoid deep relative chains when aliases are available.

## Error handling

- Do not swallow errors silently.
- Throw typed errors with context when possible.
- Include failure metadata useful for audit and troubleshooting.

## Logging

- Use structured logging through runtime logger modules.
- Never log secrets or raw credentials.
- Include identifiers (run ID, command ID, agent ID) when available.

## 5) Foundry and Cowork Change Rules

## Foundry (`src/foundry/*`)

- Keep orchestration state transitions explicit and auditable.
- Preserve peer-review and quality-gate stages when modifying flow logic.
- Keep request/report contracts synchronized with orchestration behavior.

## Cowork (`src/cowork/*`)

- Maintain command/agent registry compatibility.
- Validate plugin loader changes against bundled and system plugin discovery.
- Keep permission gating deny-safe by default for new tool paths.

## 6) Testing Expectations by Change Type

- **Foundry orchestration changes**: run unit tests plus end-to-end orchestration path checks.
- **Cowork runtime changes**: run `tests/unit/cowork/*` suites.
- **Agent or tool changes**: add or update targeted unit/integration tests.
- **CLI/TUI behavior changes**: validate command path and visible operator output.

At minimum, run `npm run lint`, `npm run build`, `npx tsc --noEmit`, and relevant test suites before finalizing.

## 7) Security and Governance Requirements

- Protect filesystem/tool execution boundaries.
- Preserve redaction controls in `src/security/*`.
- Keep policy and review checks wired in `src/governance/*` and `src/review/*`.
- Avoid introducing hardcoded secrets, paths, or mock IDs into production code paths.

## 8) Documentation Maintenance

If behavior changes, update at least:

- `README.md` (operator-facing behavior)
- `AGENTS.md` (developer process/standards)
- Any impacted architecture/integration docs (`INTEGRATION_GUIDE.md`, `TUI_INTEGRATION.md`, Foundry docs)

For strategic remediation planning, keep `docs/ENTERPRISE_GAP_BACKLOG.md` current.

## 9) Definition of Done

A change is done when:

1. Implementation is complete and coherent with runtime architecture.
2. Tests and validation commands pass for impacted areas.
3. Security/governance implications are addressed.
4. Documentation reflects the new behavior.
