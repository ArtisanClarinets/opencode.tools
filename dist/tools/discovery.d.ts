/**
 * Interface for a captured discovery item.
 */
export interface DiscoveryItem {
    id: string;
    type: 'question' | 'decision' | 'constraint' | 'risk' | 'acceptance_criteria';
    content: string;
    rationale?: string;
    source?: string;
}
/**
 * Project stack information
 */
export interface ProjectStack {
    languages: string[];
    frameworks: string[];
    databases: string[];
    cloudServices: string[];
    buildTools: string[];
    testingFrameworks: string[];
    packageManagers: string[];
}
/**
 * Project structure information
 */
export interface ProjectStructure {
    rootFiles: string[];
    sourceDirectories: string[];
    testDirectories: string[];
    configFiles: string[];
    totalFiles: number;
    totalLinesOfCode: number;
}
/**
 * Analysis result
 */
export interface DiscoveryResult {
    sessionId: string;
    projectPath: string;
    stack: ProjectStack;
    structure: ProjectStructure;
    securityFindings: string[];
    risks: DiscoveryItem[];
    recommendations: string[];
    artifacts: DiscoveryItem[];
}
/**
 * Start a new discovery session - analyzes a project directory
 */
export declare function startSession(clientName: string, projectPath?: string): Promise<DiscoveryResult>;
/**
 * Export discovery session artifact
 */
export declare function exportSession(sessionId: string, result: DiscoveryResult): Promise<{
    filePath: string;
    artifacts: DiscoveryItem[];
    summary: string;
}>;
/**
 * Quick stack detection
 */
export declare function detectStack(projectPath?: string): Promise<ProjectStack>;
//# sourceMappingURL=discovery.d.ts.map