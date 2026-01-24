import { z } from 'zod';

export type RunId = string;
export type ToolId = string;

export interface RunContext {
  runId: RunId;
  mode: 'live' | 'replay';
  baseDir: string;
  manifest: RunManifest;
  startTime: string;
}

export interface RunManifest {
  runId: RunId;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
  tools: Record<ToolId, ToolConfig>;
  artifacts: ArtifactRecord[];
  gates: GateResult[];
  environment: Record<string, string>; // Redacted env vars
}

export interface ToolConfig {
  id: ToolId;
  version: string;
  enabled: boolean;
}

export interface ArtifactRecord {
  id: string;
  path: string; // Relative to run dir
  type: string;
  hash: string;
  createdAt: string;
  metadata: Record<string, any>;
}

export interface GateResult {
  gateId: string;
  status: 'passed' | 'failed' | 'skipped';
  timestamp: string;
  reason?: string;
  artifactsChecked: string[];
}

export const ToolCallSchema = z.object({
  id: z.string(),
  toolId: z.string(),
  args: z.any(),
  timestamp: z.string(),
  durationMs: z.number(),
  success: z.boolean(),
  output: z.any().optional(),
  error: z.any().optional(),
  outputHash: z.string().optional()
});

export type ToolCallRecord = z.infer<typeof ToolCallSchema>;
