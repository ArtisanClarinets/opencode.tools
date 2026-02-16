# Research Agent Guide

## Overview

The **Research Agent** is a production-ready autonomous agent designed to gather, analyze, and synthesize information about companies, industries, competitors, and technology stacks. It replaces previous mock implementations with a robust, functional system powered by real-time web search and structured data persistence.

## Key Features

-   **Real-time Web Search**: Uses DuckDuckGo HTML scraping to gather up-to-date information.
-   **Robust Validation**: All inputs and outputs are validated using **Zod** schemas, ensuring type safety and data integrity.
-   **Resilience**: Implements exponential backoff and retry logic for network operations to handle transient failures.
-   **Persistence**: Findings are stored in a local JSON database (`data/research_db.json`), preserving research history across sessions.
-   **Governance**: Integrated `ResearchGatekeeper` ensures source sufficiency and domain diversity before finalizing research.

## Usage

The Research Agent is integrated into the OpenCode Tools TUI (Text User Interface). Direct CLI execution is deprecated to ensure consistent governance and workflow orchestration.

### Interactive Mode

1.  Start the TUI:
    ```bash
    npm run tui
    ```
2.  Select **Research Agent** from the main menu.
3.  Follow the prompts to enter:
    -   **Company Name**
    -   **Industry**
    -   **Goals**
    -   **Constraints** (optional)

The agent will execute a multi-iteration research loop, refining its queries and synthesizing a dossier.

### Output

Upon completion, the agent generates a comprehensive **Research Dossier** containing:

-   **Company Summary**: Key operational details.
-   **Industry Overview**: Trends and market analysis.
-   **Competitor Analysis**: Top 5 competitors with differentiation.
-   **Tech Stack Assessment**: Identified frontend, backend, and infrastructure technologies.
-   **Risks & Opportunities**: Strategic insights derived from the data.
-   **Recommendations**: Actionable steps based on findings.

Artifacts are saved to the `artifacts/` directory with detailed JSON logs.

## Configuration

The agent requires no external API keys for its core web search functionality.

### Environment Variables

-   `LOG_LEVEL`: Set to `debug` for verbose logging (default: `info`).

## Architecture

### Components

-   **`ResearchAgent`** (`agents/research/research-agent.ts`): Core logic class.
-   **`PhdResearchWorkflow`** (`src/workflows/phd-research-workflow.ts`): Orchestrates the research, summarization, and review process.
-   **`JsonDatabase`** (`src/database/json-db.ts`): Local persistence layer.

### Data Flow

1.  **Input**: User provides a `ClientBrief`.
2.  **Validation**: `ResearchInputSchema` validates the brief.
3.  **Execution**:
    -   Agent generates search queries.
    -   `webfetch` tool retrieves HTML content.
    -   Heuristics extract relevant data (competitors, tech stack).
    -   `ResearchGatekeeper` evaluates source quality.
4.  **Storage**: Findings are saved to `ResearchRecord` in the DB.
5.  **Output**: A structured `ResearchOutput` object is returned.

## Troubleshooting

-   **Search Failures**: If the agent fails to gather data, check your internet connection. The agent will automatically retry failed requests.
-   **Validation Errors**: Ensure your input brief contains at least a Company Name, Industry, and one Goal.
