"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSession = startSession;
exports.exportSession = exportSession;
// tools/discovery.ts
const audit_1 = require("./audit"); // Assuming relative path for stub tools
const RUN_ID = 'mock-run-123'; // Hardcoded for stub purposes
/**
 * C1: TUI “QA Session” recorder
 * Starts a new discovery session and prepares for capturing structured input.
 */
async function startSession(clientName) {
    const sessionId = `disc-sess-${Date.now()}`;
    await (0, audit_1.logToolCall)(RUN_ID, 'discovery.session.start', { clientName }, { sessionId });
    return { sessionId, status: "Discovery session started, ready to record structured Q&A." };
}
/**
 * Exports the structured discovery session artifact.
 * @param sessionId The ID of the session to export.
 */
async function exportSession(sessionId) {
    // Stub: Simulates capturing complex, structured inputs from the TUI.
    const artifacts = [
        { id: 'q1', type: 'question', content: 'Does the system need to support multi-tenancy?' },
        { id: 'd1', type: 'decision', content: 'Authentication will use OAuth 2.0/OIDC.', rationale: 'Leverages existing enterprise standards.' },
        { id: 'c1', type: 'constraint', content: 'Must use Python/FastAPI for the backend.' },
        { id: 'r1', type: 'risk', content: 'Third-party API dependency for payments could cause downtime.' },
        { id: 'ac1', type: 'acceptance_criteria', content: 'User must be able to log in within 2 seconds (P90).' }
    ];
    const filePath = `discovery/${sessionId}.json`;
    // In a real flow, this would write the artifacts to the file system.
    await (0, audit_1.logToolCall)(RUN_ID, 'discovery.session.export', { sessionId }, { filePath, item_count: artifacts.length });
    return { filePath, artifacts };
}
//# sourceMappingURL=discovery.js.map