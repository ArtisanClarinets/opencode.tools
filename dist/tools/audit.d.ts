/**
 * Records every tool call (web fetch, search, file write, etc.) for deterministic replay.
 * @param runId The ID of the current run.
 * @param toolName The name of the tool called.
 * @param inputs The input arguments to the tool.
 * @param outputs The output of the tool call.
 * @returns Status of the logging operation.
 */
export declare function logToolCall(runId: string, toolName: string, inputs: any, outputs: any): Promise<any>;
/**
 * Replays a specific run using cached tool outputs.
 * @param runId The ID of the run to replay.
 * @returns The manifest of the replayed run.
 */
export declare function replayRun(runId: string): Promise<any>;
/**
 * Checks for prompt version and input hash to guarantee reproducibility.
 * @param runId The ID of the current run.
 * @param promptHash Hash of the prompt used.
 * @returns Status of the check.
 */
export declare function checkReproducibility(runId: string, promptHash: string): Promise<any>;
//# sourceMappingURL=audit.d.ts.map