/**
 * Interface for a captured QA/Discovery item.
 */
export interface DiscoveryItem {
    id: string;
    type: 'question' | 'decision' | 'constraint' | 'risk' | 'acceptance_criteria';
    content: string;
    rationale?: string;
}
/**
 * C1: TUI “QA Session” recorder
 * Starts a new discovery session and prepares for capturing structured input.
 */
export declare function startSession(clientName: string): Promise<{
    sessionId: string;
    status: string;
}>;
/**
 * Exports the structured discovery session artifact.
 * @param sessionId The ID of the session to export.
 */
export declare function exportSession(sessionId: string): Promise<{
    filePath: string;
    artifacts: DiscoveryItem[];
}>;
//# sourceMappingURL=discovery.d.ts.map