# OpenCode Tools

**Foundry-driven autonomous engineering team orchestration for OpenCode.**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/opencode/ai-tool)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

OpenCode Tools provides a multi-agent runtime that combines Foundry orchestration, Cowork plugin-based delegation, and a TUI/CLI operator interface.

## Current Status

- Foundry is now the default orchestrator agent in `opencode.json`.
- Cowork command/agent/plugin loading is integrated and test-covered.
- Quality gates run through lint/build/typecheck/tests.
- The platform is functional for development workflows, but still has open enterprise hardening items. See `docs/ENTERPRISE_GAP_BACKLOG.md`.

## Core Capabilities

- **Foundry Orchestration**: phased execution, iterative loops, peer review, and release gating.
- **Cowork Runtime**: command registry, agent registry, plugin loading, permission gates, persistent event bus, Postgres-backed workspace/blackboard storage, and a Phase 1 workflow foundation.
- **Specialized Agents**: research, docs, architecture, codegen, QA, delivery, PDF generation.
- **Operator Interfaces**: interactive TUI and CLI commands for orchestration and plugin operations.

## 🆕 Collaborative Development Teams (New!)

OpenCode Tools now supports **parallel, event-driven autonomous development teams**:

### Real-Time Autonomous Teams
- **Dynamic team formation** from project requirements
- **Multiple agents working simultaneously** on different tasks
- **Intelligent task routing** based on capabilities and workload
- **Automatic team health monitoring** with recovery
- **Role-based collaboration** with specialized agents

### Parallel State Monitoring
- **Continuous security monitoring** (vulnerability scanning, dependency audits)
- **Compliance monitoring** (SOX, GDPR, PCI-DSS support)
- **Observability metrics** (performance, errors, throughput)
- **Automatic escalation** to human operators when thresholds exceeded
- **Background execution** while other agents work

### Team Collaboration
- **Agent-to-agent communication** via secure messaging
- **Help request system** with capability-based routing
- **Review coordination** with multi-party approval workflows
- **Issue escalation** with severity levels and context
- **Broadcast messaging** for team announcements

### Evidence Collection
- **Automatic evidence collection** from all system events
- **Cryptographic signing** (RSA-SHA256) for tamper-proof audit trails
- **Evidence chain verification** for compliance
- **Compliance package export** for regulatory audits
- **Full traceability** of all decisions and actions

### Quick Start with Teams

```bash
# Execute project with full team collaboration
opencode-tools orchestrate --project "MyApp" --mode full

# Teams form automatically based on project requirements
# Monitoring starts in background
# Evidence is collected automatically
```

### Configuration

Enable collaboration features in `opencode.json`:

```json
{
  "orchestrator": "foundry",
  "foundry": {
    "enableCollaboration": true,
    "enableMonitoring": true,
    "enableEvidence": true,
    "monitoring": {
      "securityScanInterval": 60000,
      "complianceRegulation": "SOX",
      "autoEscalate": true
    }
  }
}
```

See [Foundry-Cowork Integration Guide](docs/FOUNDRY_COWORK_INTEGRATION_GUIDE.md) for detailed documentation.

Cowork runtime persistence and config can also be wired via environment:

```bash
COWORK_PERSISTENCE_CONNECTION_STRING=postgres://localhost:5432/opencode
COWORK_PERSISTENCE_MAX_CONNECTIONS=20
COWORK_PERSISTENCE_AUTO_MIGRATE=true
COWORK_TENANT_ID=default
COWORK_TENANT_NAME="Default Tenant"
COWORK_TENANT_OWNER_ID=default-owner
```

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Launch TUI
npm run tui

# Run Foundry orchestration from CLI
npm run build && opencode-tools orchestrate --project "MyApp"
```

Short alias is also available after global install:

```bash
oct orchestrate --project "MyApp"
```

## CLI Commands

```bash
# Foundry orchestration entry
opencode-tools orchestrate --project "MyApp" --mode full
opencode-tools orchestrate --project "MyApp" --mode research

# Interactive TUI
opencode-tools tui

# Cowork system
opencode-tools cowork list
opencode-tools cowork run <command> [args...]
opencode-tools cowork agents
opencode-tools cowork plugins

# MCP server
opencode-tools mcp

# Manual integration helper
opencode-tools integrate

# Runtime wiring verification
opencode-tools verify
opencode-tools --verify
```

Notes:

- `orchestrate` executes via Foundry orchestrator flow and supports `--mode research|docs|architect|code|full`.
- Mode presets currently tune iteration and quality-gate behavior (`research/docs` skip gates, `architect/code/full` run gates).
- `cowork` commands operate through loaded plugins and native agent config.
- `verify` checks Foundry/Cowork wiring, bridge health, and runtime alias resolution (`--verify` is supported for compatibility).
- `pdf` command now validates generated bytes and fails fast if the payload is empty or not a valid PDF header.
- Additional commands like `research`, `docs`, and `architect` exist, with depth depending on subsystem maturity.

## Development

```bash
# TypeScript build
npm run build

# TUI dev run
npm run dev

# Lint
npm run lint

# Typecheck
npx tsc --noEmit

# Full validation (lint + build + full tests)
npm run validate
```

## Testing

```bash
# Standard
npm test

# Segmented suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:security

# Full pipeline
npm run test:all

# Cowork Postgres integration tests (requires Docker)
npx jest tests/integration/cowork/persistence-and-eventing.integration.test.ts --runInBand
```

`test:security` currently runs with `--passWithNoTests`, so it exits cleanly when no dedicated security tests are present.

## Architecture Map

- CLI entry: `src/cli.ts`
- TUI entry: `src/tui-app.ts`
- Foundry runtime bridge: `src/foundry/*`
- Cowork runtime: `src/cowork/*`
- Agent implementations: `agents/*`
- MCP tool server: `tools/mcp-server.ts`

## Governance and Security

- Policy/gatekeeping: `src/governance/*`
- Review workflows: `src/review/*`
- Secret redaction: `src/security/*`
- Audit/runtime trace layers: `src/runtime/*`

## Documentation

- Developer guide: `AGENTS.md`
- Integration: `INTEGRATION_GUIDE.md`
- TUI integration notes: `TUI_INTEGRATION.md`
- Foundry implementation notes: `FOUNDRY_IMPLEMENTATION_SUMMARY.md`
- **Collaborative Teams Guide**: `docs/FOUNDRY_COWORK_INTEGRATION_GUIDE.md`
- **API Reference**: `docs/API_REFERENCE.md`
- **Implementation Summary**: `docs/IMPLEMENTATION_SUMMARY.md`
- **Cowork Persistence/Eventing/Workflows (Phase 1)**: `docs/COWORK_PERSISTENCE_EVENTING_WORKFLOWS.md`
- Enterprise backlog and roadmap: `docs/ENTERPRISE_GAP_BACKLOG.md`

## Contributing

1. Create a branch from `develop`.
2. Implement focused changes.
3. Run `npm run validate`.
4. Update docs for behavior changes.
5. Open PR with test evidence and risk notes.

## License

MIT - see `LICENSE`.
