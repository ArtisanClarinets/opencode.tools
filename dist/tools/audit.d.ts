/**
 * Records every tool call for deterministic replay.
 */
export declare function logToolCall(runId: string, toolName: string, inputs: any, outputs: any): Promise<any>;
/**
 * Replays a specific run using cached tool outputs.
 */
export declare function replayRun(runId: string): Promise<any>;
/**
 * Checks for prompt version and input hash to guarantee reproducibility.
 */
export declare function checkReproducibility(runId: string, promptHash: string): Promise<any>;
//# sourceMappingURL=audit.d.ts.map