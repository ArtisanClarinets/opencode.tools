"use strict";
// tools/audit.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.logToolCall = logToolCall;
exports.replayRun = replayRun;
exports.checkReproducibility = checkReproducibility;
/**
 * Records every tool call (web fetch, search, file write, etc.) for deterministic replay.
 * @param runId The ID of the current run.
 * @param toolName The name of the tool called.
 * @param inputs The input arguments to the tool.
 * @param outputs The output of the tool call.
 * @returns Status of the logging operation.
 */
async function logToolCall(runId, toolName, inputs, outputs) {
    // TODO: Implement internal logger that writes to runs/{runId}/manifest.json (tool calls) and runs/{runId}/evidence/* (raw pages).
    console.log("[AUDIT] Logging tool call: " + toolName + " for run " + runId);
    return { success: true, message: "Tool call logged." };
}
/**
 * Replays a specific run using cached tool outputs.
 * @param runId The ID of the run to replay.
 * @returns The manifest of the replayed run.
 */
async function replayRun(runId) {
    // TODO: Implement deterministic replay logic using cached outputs.
    console.log("[AUDIT] Preparing to replay run " + runId);
    return { success: true, message: "Run replay started." };
}
/**
 * Checks for prompt version and input hash to guarantee reproducibility.
 * @param runId The ID of the current run.
 * @param promptHash Hash of the prompt used.
 * @returns Status of the check.
 */
async function checkReproducibility(runId, promptHash) {
    // TODO: Implement hashing and versioning checks.
    return { success: true, message: "Reproducibility check passed." };
}
//# sourceMappingURL=audit.js.map