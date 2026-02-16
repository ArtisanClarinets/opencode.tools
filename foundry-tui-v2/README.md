# Foundry Interactive TUI v2

A production-ready Terminal User Interface (TUI) for "Foundry Interactive" using React + Ink with a chat-based CTO orchestrator and real-time project management system.

## Features

- **Split-Pane UI**: Chat panel (60%) and Overview panel (40%)
- **Event-Driven Architecture**: Real-time updates via EventBus
- **CTO Orchestrator Agent**: AI-powered project management with LLM integration
- **Mock Runtime**: Fully functional demo mode without external dependencies
- **Keyboard Navigation**: Intuitive shortcuts for all actions
- **Strongly Typed**: Full TypeScript support with strict mode
- **Comprehensive Testing**: Unit tests for all core components

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Run the demo
npm run demo

# Build for production
npm run build

# Run tests
npm test
```

## Commands

Once running, use these commands in the chat:

- `/status` - Show project status
- `/agents` - View agents panel
- `/gates` - View quality gates
- `/artifacts` - View artifacts
- `/team` - View team members
- `/phase <name>` - Set project phase
- `/spawn <role> <task>` - Spawn new agent
- `/help` - Show help overlay

## Keyboard Shortcuts

- `Ctrl+K` - Toggle help overlay
- `Ctrl+N` - Create new project
- `Ctrl+P` - Project selector
- `Tab` - Cycle focus areas
- `Shift+Tab` - Cycle focus areas (reverse)
- `Esc` - Close overlays
- `Ctrl+C` - Exit application

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design and Mermaid diagrams.

## Project Structure

```
src/
├── agents/           # CTO Agent implementation
├── components/       # React/Ink UI components
│   ├── chat/        # Chat panel components
│   ├── layout/      # Layout components
│   └── overview/    # Overview panel components
├── hooks/           # Custom React hooks
├── mock/            # Mock implementations
├── services/        # Core services (EventBus)
├── store/           # State management
├── types/           # TypeScript types
├── app.tsx          # Main application
└── demo.ts          # Demo entry point
```

## Tech Stack

- Node.js >= 20
- TypeScript (strict mode)
- React 18
- Ink 4 (React for terminals)
- Zod (runtime validation)
- Vitest (testing)

## License

MIT
