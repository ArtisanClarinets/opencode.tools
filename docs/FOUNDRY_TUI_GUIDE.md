# Foundry TUI Guide

## Purpose

Use the dedicated Foundry TUI when you want Foundry-focused workflows and visibility without loading the broader general TUI.

## Commands

```bash
# Dedicated Foundry TUI entrypoint
npm run foundry:tui

# General TUI entrypoint (separate UI)
npm run tui
```

Implementation entrypoint: `src/foundry-tui-app.ts`

## Runtime Surface

- App root: `src/foundry-tui/App.tsx`
- Store provider: `src/foundry-tui/store/store.tsx`
- Screens:
  - `src/foundry-tui/screens/DashboardScreen.tsx`
  - `src/foundry-tui/screens/ProjectScreen.tsx`
  - `src/foundry-tui/screens/AgentHubScreen.tsx`
  - `src/foundry-tui/screens/ExecutionScreen.tsx`
  - `src/foundry-tui/screens/ConversationScreen.tsx`

## Production Deliverable Policy

- Foundry runs default to strict deliverable-scope enforcement (`enforceDeliverableScope: true`).
- Execution results surface deliverable-scope pass/fail in orchestrator summaries.
- Policy baseline: `docs/PRODUCTION_DELIVERABLE_POLICY.md`.

## Built-In Shortcuts

- `1-5`: jump directly between screens
- `Tab` / `Right Arrow`: next screen
- `Shift+Tab` / `Left Arrow`: previous screen
- `Ctrl+S`: submit project intake
- `Ctrl+E`: export placeholder action

Source: `src/foundry-tui/App.tsx`

## Verification

```bash
npm run lint
npm run build
npx tsc --noEmit
npm run validate:deliverable-scope
npm run test:unit -- --testPathPattern=foundry/tui
```

Key runtime bridge tests: `tests/unit/foundry/tui/routes/runtime-bridge.test.ts`
