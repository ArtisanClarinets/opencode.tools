# OpenCode Tools

Automated client project research, documentation, and code generation toolkit.

## Overview

OpenCode Tools is a comprehensive suite of autonomous agents designed to streamline client project workflows:

- **Research Agent**: Automated client and industry research
- **Documentation Agent**: PRD, SOW, and delivery requirements generation
- **Code Generation Agent**: Project scaffolding and feature implementation
- **QA Agent**: Test planning and automated testing
- **Delivery Agent**: Project handoff and deployment support

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run research agent
npm run research -- --brief "path/to/brief.json" --output "path/to/dossier.json"

# Run documentation agent
npm run docs -- --input "path/to/dossier.json" --output "path/to/prd.md"

# Run code generation agent
npm run codegen -- --architecture "path/to/arch.json" --output "path/to/project"
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

The Research Agent automates gathering context about clients, their industries, competitors, and technology stacks.

**Usage:**
```bash
npm run research -- --brief "client-brief.json" --output "research-dossier.json"
```

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

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Build project
npm run build

# Run in development mode
npm run dev
```

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