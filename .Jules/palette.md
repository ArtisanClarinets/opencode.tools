## 2026-02-14 - Cowork Orchestrator REPL Integration
**Learning:** To support "continuous control" or REPL-like behavior in the TUI, the standard  promise-based flow is insufficient.
**Action:** Implemented a `repl: true` flag and `onInput` handler in `AgentDefinition`. `ChatScreen` was updated to allow input during the 'running' state if this flag is present, enabling real-time command dispatch to a persistent orchestrator instance.
