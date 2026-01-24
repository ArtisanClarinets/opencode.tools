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
    environment: Record<string, string>;
}
export interface ToolConfig {
    id: ToolId;
    version: string;
    enabled: boolean;
}
export interface ArtifactRecord {
    id: string;
    path: string;
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
export declare const ToolCallSchema: z.ZodObject<{
    id: z.ZodString;
    toolId: z.ZodString;
    args: z.ZodAny;
    timestamp: z.ZodString;
    durationMs: z.ZodNumber;
    success: z.ZodBoolean;
    output: z.ZodOptional<z.ZodAny>;
    error: z.ZodOptional<z.ZodAny>;
    outputHash: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ToolCallRecord = z.infer<typeof ToolCallSchema>;
//# sourceMappingURL=run.d.ts.map