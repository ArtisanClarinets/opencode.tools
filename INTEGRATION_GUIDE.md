# OpenCode Tools Integration Guide

## 🚀 Quick Start

The OpenCode Tools are now fully integrated into the opencode CLI! You can access the Research Agent directly from the command line.

### Prerequisites
```bash
# Ensure you're in the opencode-tools directory
cd Developer/opencode-tools

# Build the project (if not already built)
npm run build

# Link globally (if not already linked)
npm link --force
```

## � Client Delivery Workflow (New)

The new autonomous delivery workflow orchestrates research, analysis, review, and export in a single sweep.

### Usage

```bash
npm run run:delivery
```

This command executes `scripts/run-delivery.ts`, which:
1.  Initializes a new **Run** with a unique ID.
2.  Executes **Research** using the Google Search Provider (or mock).
3.  Performs **Analysis** (Claim extraction, Citation scoring).
4.  Runs a **Peer Review** loop against the `ResearchRubric`.
5.  **Exports** a final delivery bundle ZIP.

### Output

Artifacts are stored in `runs/<runId>/`:
-   `manifest.json`: Complete run state and gate results.
-   `toolcalls.jsonl`: Audit log of all tool executions.
-   `artifacts/`:
    -   `evidence/`: Raw fetched documents.
    -   `deliverables/`: Generated Markdown reports.
-   `delivery-bundle.zip`: Final package.

## �📊 Research Agent Commands (Legacy CLI)

> **Note**: The CLI commands below refer to the interactive TUI tools. for the full automated workflow, use `npm run run:delivery`.

### 1. Full Research with Client Brief
```bash
opencode research --brief examples/client-brief.json --output artifacts/my-research.json --verbose
```

**Options:**
- `--brief <path>`: Path to client brief JSON file (required)
- `--output <path>`: Output path for results (default: artifacts/research-output.json)
- `--format <format>`: Output format - json or md (default: json)
- `--verbose`: Show detailed progress and summary

### 2. Quick Research (Minimal Input)
```bash
opencode quick-research --company "AcmeCorp" --industry "Healthcare" --description "A healthcare technology company"
```

**Options:**
- `--company <name>`: Company name (required)
- `--industry <industry>`: Industry type (required)
- `--description <desc>`: Company description (optional)
- `--output <path>`: Output path (default: artifacts/quick-research.json)

## 🔧 Utility Commands

### List Available Agents
```bash
opencode agents
```
Shows all available agents and their capabilities.

### Check System Status
```bash
opencode status
```
Shows build status, available agents, and templates.

### Initialize Project Structure
```bash
opencode init
```
Creates default directories and example files.

## 📁 Output Structure

Research generates multiple files:

```
artifacts/
├── research-output.json          # Complete research results
├── research-output-dossier.json  # Research dossier only
├── research-output-sources.json  # Sources and citations
└── research-output-meta.json     # Provenance metadata
```

## 🎯 Example Workflow

1. **Initialize project:**
   ```bash
   opencode init
   ```

2. **Run research:**
   ```bash
   opencode research --brief examples/client-brief.json --verbose
   ```

3. **View results:**
   ```bash
   cat artifacts/research-output-dossier.json
   ```

4. **Quick research for new client:**
   ```bash
   opencode quick-research --company "NewCorp" --industry "FinTech"
   ```

## 🔍 Research Output Example

The Research Agent generates comprehensive dossiers including:

```json
{
  "companySummary": "TechCorp operates in the FinTech industry...",
  "industryOverview": "The fintech industry is experiencing rapid growth...",
  "competitors": [
    {
      "name": "Stripe",
      "url": "https://stripe.com",
      "differentiation": "Market leader with comprehensive API ecosystem",
      "marketPosition": "Dominant player in online payments"
    }
  ],
  "techStack": {
    "frontend": ["React", "TypeScript"],
    "backend": ["Node.js", "PostgreSQL"],
    "infrastructure": ["AWS", "Docker"],
    "thirdParty": ["Stripe", "SendGrid"]
  },
  "risks": [
    "Regulatory compliance requirements",
    "Competition from established players"
  ],
  "opportunities": [
    "Growing demand for contactless payments",
    "International expansion potential"
  ],
  "recommendations": [
    "Prioritize security and compliance certifications",
    "Develop strategic partnerships"
  ]
}
```

## 🛠️ Integration with OpenCode

The Research Agent is now fully accessible through the opencode CLI:

- **Command:** `opencode research` or `opencode quick-research`
- **Global Access:** Available from any directory after `npm link`
- **Structured Output:** JSON format with provenance tracking
- **Error Handling:** Comprehensive error messages and validation

## 📋 Next Steps

With the Research Agent integrated, you can:

1. **Use it immediately** for client research
2. **Build Documentation Agent** to consume research dossiers
3. **Extend the CLI** as new agents are developed
4. **Create custom workflows** combining multiple agents

The foundation is solid and ready for extending with additional agents!