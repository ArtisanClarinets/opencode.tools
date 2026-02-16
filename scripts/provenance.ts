import { v4 as uuidv4 } from 'uuid';

export interface ProvenanceMeta {
  agentId: string;
  agentName: string;
  runId: string;
  timestamp: string;
  modelId: string;
  promptPath: string;
  mcpPath: string;
  promptVersion: string;
  mcpVersion: string;
}

/**
 * Generates a ProvenanceMeta object for a new agent artifact.
 * This data is typically saved as a meta.json file alongside the artifact.
 *
 * Requirements addressed (TODO.md lines 121, 124-125):
 * - meta.json includes: prompt version, MCP version, time, agent id.
 * - artifact header includes: agent name, prompt file path, MCP path, model id, timestamp, unique run id.
 */
export function generateProvenance(
  agentId: string,
  agentName: string,
  modelId: string,
  promptPath: string,
  mcpPath: string,
): ProvenanceMeta {
  const now = new Date().toISOString();
  const runId = uuidv4();

  // Extract version from file paths (e.g., 'path/to/v1.yaml' -> 'v1')
  const promptVersion = promptPath.split('/').pop()?.split('.')[0] || 'unknown';
  const mcpVersion = mcpPath.split('/').pop()?.split('.')[0] || 'unknown';

  return {
    agentId,
    agentName,
    runId,
    timestamp: now,
    modelId,
    promptPath,
    mcpPath,
    promptVersion,
    mcpVersion,
  };
}

/**
 * Generates a Markdown header string suitable for prepending to a generated artifact.
 */
export function generateMarkdownHeader(meta: ProvenanceMeta): string {
  return "---" +
    "\nProvenance:" +
    `\n  Agent: ${meta.agentName} (${meta.agentId})` +
    `\n  Run ID: ${meta.runId}` +
    `\n  Timestamp: ${meta.timestamp}` +
    `\n  Model ID: ${meta.modelId}` +
    `\n  Prompt: ${meta.promptPath} (v${meta.promptVersion})` +
    `\n  MCP: ${meta.mcpPath} (v${meta.mcpVersion})` +
    "\n---" +
    "\n\n";
}