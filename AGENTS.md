AGENTS for OpenCode Tools
=========================

Purpose
-------
This document outlines a proposed set of autonomous and semi-autonomous agents to power the OpenCode tools suite. The agents are designed to automate research, produce client-facing documentation (PRDs, SOWs, delivery requirements), and accelerate hands-on coding for client projects.

Agent Catalog
-------------

1) Research Agent
- Role: Gather context about a client, their industry, competitors, existing technology stack, public resources, and any supplied assets.
- Inputs: client brief, domain keywords, URLs, repo access (optional), prior work notes.
- Outputs: research dossier (summary, risks, opportunities, references), raw source list, recommended reading.
- Capabilities: webfetch, repo scanning, structured note export (JSON/Markdown), citation tracking.

2) Discovery Agent
- Role: Drive stakeholder discovery by generating tailored interview guides and extracting clarifying questions for requirements.
- Inputs: research dossier, client goals, personas.
- Outputs: interview guides, prioritized questions, acceptance criteria draft.

3) Documentation Agent
- Role: Create client-facing artifacts: PRD, Scope of Work (SOW), Statements, Delivery Requirements, Milestones, and Acceptance Tests.
- Inputs: research dossier, discovery outputs, templates, legal clauses (optional).
- Outputs: ready-to-review Markdown documents, change log, versioned templates.

4) Architecture & Planning Agent
- Role: Propose system architecture, select tech stack options, cost/time tradeoffs, and produce work breakdown (epics, stories, estimates).
- Inputs: documentation outputs, constraints (budget, timeline), team skills.
- Outputs: architecture diagrams (text/mermaid), backlog, sprint plan, risk register.

5) Code Generation Agent (Coding Agent)
- Role: Scaffold projects, implement features, run tests, and open PRs with detailed code explanations.
- Inputs: architecture, PRD, code style rules, repository access.
- Outputs: commits/patches, unit/integration tests, CI config, code review notes.
- Capabilities: run linters, formatters, test runners (via orchestrator), auto-generate changelogs.

6) QA & Test Agent
- Role: Generate test plans, create automated tests, perform static analysis, and summarize quality metrics.
- Inputs: codebase, PRD acceptance criteria.
- Outputs: test suites, coverage reports, vulnerability scans.

7) Delivery & Handoff Agent
- Role: Produce delivery bundles, deployment playbooks, runbooks, onboarding guides, and client handoff checklists.
- Inputs: final artifacts, infra details, credentials (secure retrieval), SLAs.
- Outputs: release notes, environment setup scripts, monitoring suggestions.

8) Assistant Orchestrator
- Role: Coordinate the agents as pipelines (research -> discovery -> docs -> architecture -> code -> QA -> delivery).
- Inputs: trigger (new client intake), policies, user overrides.
- Outputs: job state, logs, telemetry, escalation actions.


Agent Design Considerations
---------------------------

- Modularity: Agents are small, single-responsibility services so they can be swapped or updated independently.
- Observability: Each agent logs inputs, outputs, prompt versions, model config (MCPs), and citations for traceability.
- Reproducibility: Keep templates, MCPs, and prompt versions in the repository under `mcp/` and `prompts/`.
- Security: Agents that access private data use short-lived credentials and log only metadata. Secrets are never stored in plaintext in repo.
- Human-in-the-loop: By default, agents propose and wait for approval for high-impact changes (SOW, final architecture, production deploy).


Prompt & MCP (Model Control Pattern) Policies
--------------------------------------------

- Version prompts: store a copy of every prompt used for a critical output and tag it with a release id.
- MCPs: Define model temperature, token limits, chain-of-thought allowances, tool-use permissions, and allowed external calls per agent role.
- Testing prompts: Include unit tests and golden outputs for deterministic prompts (e.g., SOW templates).


Integration Points
------------------

- Webfetch / Search APIs – for public research
- Repository access (git) – for code generation and analysis
- Issue tracker / Project management APIs – to push epics/stories
- CI/CD – to run builds and tests
- Secrets Manager – to fetch credentials securely at runtime


Storage, Formats and Versioning
-------------------------------

- Structured outputs use JSON or YAML for machine consumption and Markdown for human review.
- Keep artifacts under `artifacts/{client}/{project}/{version}` with metadata files describing provenance.



Developer Guide
---------------

### 1. CLI Integration & Registration
The `opencode` CLI tool discovers agents and tools via the `opencode.json` manifest file located in the root of the package.

**`opencode.json` Structure:**
```json
{
  "name": "opencode-tools",
  "version": "1.0.0",
  "agents": [
    {
      "id": "agent-id",
      "name": "Agent Name",
      "entry": "dist/agents/agent-dir/index.js",
      "config": { "mcp": "path/to/config.yaml" }
    }
  ],
  "tools": [
    {
      "id": "tool-id",
      "name": "Tool Name",
      "entry": "dist/tools/tool-file.js"
    }
  ],
  "mcpServers": [
    {
      "name": "server-name",
      "config": "path/to/config.yaml"
    }
  ]
}
```

### 2. Creating a New Agent
1.  **Create Directory**: Create a new directory in `agents/<agent-name>`.
2.  **Implement Agent**: Create your agent class (e.g., `MyAgent.ts`). It should implement the standard Agent interface.
3.  **Export**: Create an `index.ts` in that directory that exports the agent class.
4.  **Register**: Add the agent to `opencode.json` under the `agents` array. Ensure the `entry` path points to the compiled `dist/` location.

### 3. Adding a Tool
1.  **Create File**: Create a new tool file in `tools/<tool-name>.ts`.
2.  **Implement Function**: Export a standalone function that performs the tool's action.
3.  **Register**: Add the tool to `opencode.json` under the `tools` array.

### 4. Adding an MCP Server
1.  **Define Config**: Create an MCP server configuration file (typically `v1.yaml`) in `mcp/<server-name>/`.
2.  **Register**: Add the server to `opencode.json` under the `mcpServers` array, pointing to the config file.


Next Steps (short)
------------------

1. Create a repository layout and directories for `prompts/`, `mcp/`, `templates/`, and `agents/`.
2. Draft MCPs (model settings) for each agent role starting with Research, Docs, and Code Generation.
3. Implement a minimal Orchestrator that runs the Research -> Documentation -> Architecture pipeline on a sample brief.

Refer to TODO.md for a full, prioritized plan.
