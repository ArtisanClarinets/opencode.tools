# OpenCode Tools

# OpenCode Tools

**A Complete Apple-Level Engineering Team in a Single Package**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/opencode/ai-tool)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Automated client project research, documentation, and code generation toolkit with self-iterative orchestration.

## Overview

OpenCode Tools is a comprehensive suite of autonomous agents that acts as your complete development team:

- **Research Agent**: Automated client and industry intelligence gathering
- **Documentation Agent**: World-class PRD, SOW, and specification generation  
- **Architecture Agent**: System design and backlog creation
- **PDF Agent**: Professional document generation with charts and diagrams
- **Code Generation Agent**: Full-stack project scaffolding and implementation
- **Orchestrator Agent**: Self-iterative coordination of all agents

## Global Installation

```bash
# Install globally from npm (when published)
npm install -g opencode-tools

# Or install from source
git clone https://github.com/opencode/ai-tool.git
cd opencode-tools
npm install -g .
```

## Quick Start

### Command Line Interface

```bash
# Research a company
opencode-tools research "Acme Corp" --industry "fintech"

# Generate documentation
opencode-tools docs ./research-output.json

# Create architecture
opencode-tools architect ./prd.md

# Launch interactive TUI
opencode-tools tui

# Full orchestration mode (all phases)
opencode-tools orchestrate --project "MyApp" --mode full
```

### Short Alias

```bash
# All commands work with 'oct' shorthand
oct research "Acme Corp"
oct orchestrate --project "MyApp"
```

### Local Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the interactive TUI
npm run tui

# Run tests
npm test
```

## Project Structure

```
opencode-tools/
├── agents/           # Agent implementations
├── prompts/          # Prompt templates
├── mcp/              # Model control patterns
├── templates/        # Document templates
├── artifacts/        # Generated outputs
├── scripts/          # Helper scripts
├── tests/            # Test suites
└── docs/             # Documentation
```

## Agents

### Research Agent

The Research Agent automates gathering context about clients, their industries, competitors, and technology stacks. It is now a fully production-ready agent with robust validation and persistence.

**Usage:**
Access via the TUI main menu. See [RESEARCH_AGENT_GUIDE.md](docs/RESEARCH_AGENT_GUIDE.md) for details.

**Features:**
- Company and industry analysis
- Competitor identification and analysis
- Technology stack assessment
- Risk and opportunity identification
- Cited sources and references

### Documentation Agent

The Documentation Agent creates client-facing artifacts including PRDs, SOWs, and delivery requirements.

**Usage:**
```bash
npm run docs -- --input "research-dossier.json" --type "prd" --output "project-prd.md"
```

**Features:**
- PRD generation from research data
- SOW creation with scope and timeline
- Delivery requirements documentation
- Template-based document generation

### Code Generation Agent

The Code Generation Agent scaffolds projects and implements features based on architecture and requirements.

**Usage:**
```bash
npm run codegen -- --architecture "architecture.json" --feature "user-auth" --output "./src"
```

**Features:**
- Project scaffolding
- Feature implementation
- Test generation
- CI/CD configuration

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm 8+
- TypeScript 5.x

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/opencode/ai-tool.git
cd opencode-tools

# Install dependencies
npm install

# Build the project
npm run build
```

### Development Commands

```bash
# Run in development mode (with ts-node)
npm run dev

# Run full validation (lint + build + test)
npm run validate

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# TypeScript type check only
npx tsc --noEmit
```

### Code Style and Conventions

OpenCode Tools follows strict TypeScript conventions:

- **TypeScript**: Strict mode enabled with `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`
- **Imports**: Absolute imports only (no relative paths like `../../`)
- **Naming**: PascalCase for classes, camelCase for functions/methods, UPPER_SNAKE_CASE for constants
- **Types**: Prefer interfaces over type aliases for object shapes, explicit return types on public functions
- **Errors**: Custom error classes extending `BaseError` with metadata
- **Validation**: Zod schemas for all inputs (parse, don't validate)
- **Async**: Always use async/await, never raw Promises

See [AGENTS.md](./AGENTS.md) for comprehensive code style guidelines.

### Testing Strategy

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- agents/research/research-agent.test.ts

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests  
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run security tests
npm run test:security

# Run performance tests
npm run test:performance

# Run all test types
npm run test:all
```

**Coverage Requirements** (enforced in CI/CD):
- Global: 70% branches, functions, lines, statements
- `./src/`: 80% all metrics  
- `./agents/`: 75% all metrics

**Test File Organization**:
- Unit tests co-located with source: `research-agent.ts` + `research-agent.test.ts`
- Integration tests: `tests/integration/`
- E2E tests: `tests/e2e/`
- Test utilities: `tests/utils/`

### CI/CD Pipeline

All changes go through comprehensive testing:

1. **Lint & Security**: ESLint validation, TypeScript compilation, npm audit
2. **Unit Tests**: Parallel testing by agent (research, docs, codegen, qa, etc.)
3. **Integration Tests**: Real service integrations with Redis, databases
4. **E2E Tests**: Full workflow validation  
5. **Security Tests**: OWASP, CWE vulnerability scanning
6. **Performance Tests**: Benchmarking and load testing
7. **Mutation Testing**: Code quality validation
8. **Coverage Analysis**: Combined coverage reporting with Codecov

See [`.github/workflows/test-pipeline.yml`](.github/workflows/test-pipeline.yml) for complete pipeline configuration.

### Configuration Files

- **TypeScript**: `tsconfig.json` - Strict mode, ES2020 target, commonjs modules
- **ESLint**: `.eslintrc.js` - TypeScript rules, no unused vars, no explicit any
- **Jest**: `jest.config.js` - Coverage thresholds, module name mapping, test patterns
- **CI/CD**: `.github/workflows/test-pipeline.yml` - Multi-stage validation pipeline

### Agent Development

When building or modifying agents:

1. Follow the established [AGENTS.md](./AGENTS.md) coding standards
2. Use Zod schemas for all inputs with strict validation
3. Implement proper error handling with custom error classes
4. Add comprehensive unit tests (minimum 75% coverage)
5. Include integration tests for external dependencies
6. Update relevant documentation
7. Ensure backward compatibility when possible
8. Add audit logging for agent actions

### Contributing Guidelines

1. **Fork and Branch**: Create feature branch from `develop`
2. **Code Quality**: Follow all linting and type checking rules
3. **Testing**: Add tests for all new functionality
4. **Documentation**: Update docs for public APIs
5. **Pull Request**: Use format `type(scope): description`
6. **Review**: Address all reviewer feedback
7. **Merge**: Only after CI passes and approval received

**Branch Naming**:
- Features: `feature/add-oauth-authentication`
- Bug fixes: `fix/research-timeout-error`
- Documentation: `docs/update-api-reference`

**Commit Message Format**:
```bash
git commit -m "feat(auth): implement JWT authentication"
git commit -m "fix(research): resolve web scraping timeout"
git commit -m "test(security): add OAuth validation tests"
```

**PR Requirements**:
- All CI checks passing
- Code coverage maintained
- Security review for agent changes
- Documentation updated
- 1+ maintainer approval

See [AGENTS.md](./AGENTS.md) for comprehensive development guidelines.

## Configuration

### Model Control Patterns (MCP)

Configure agent behavior in `mcp/{agent}/v1.yaml`:

```yaml
temperature: 0.0
max_tokens: 1500
external_tools:
  - webfetch
  - search
```

### Prompt Templates

Customize agent prompts in `prompts/{agent}/v1/`:

- `research-dossier.md` - Research agent instructions
- `prd-from-dossier.md` - Documentation agent instructions
- `scaffold-project.md` - Code generation instructions

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License

MIT License - see LICENSE file for details.