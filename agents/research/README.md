# Research Agent – OpenCode Tools

This directory contains the Research Agent implementation.

## Purpose

The Research Agent automates gathering context about a client, their industry, competitors, and existing technology stack. It outputs a structured dossier with cited sources, risks, and opportunities.

## Files

- `research-agent.ts` – Core agent implementation
- `types.ts` – TypeScript interfaces for inputs/outputs
- `index.ts` – Entry point and orchestration

## Usage

```bash
npm run research -- --brief "path/to/brief.json" --output "path/to/dossier.json"
```

## Outputs

- `dossier.json` – Structured research output
- `sources.json` – Cited sources and references
- `meta.json` – Provenance metadata