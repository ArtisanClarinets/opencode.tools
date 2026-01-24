/**
 * TUI-Integrated Research Agent
 * Accessible ONLY through OpenCode TUI - no standalone CLI
 */
export declare class TUIResearchAgent {
    private agent;
    private readonly artifactsDir;
    constructor();
    /**
     * Run research from TUI with interactive prompts
     */
    runInteractive(): Promise<void>;
    /**
     * Run research with predefined parameters (for TUI automation)
     */
    runWithParams(params: ResearchParams): Promise<ResearchResult>;
    /**
     * Gather input through TUI prompts
     */
    private gatherInput;
    /**
     * TUI-compatible prompt (can be replaced with actual TUI prompts)
     */
    private tuiPrompt;
    /**
     * Convert parameters to ResearchInput
     */
    private paramsToInput;
    /**
     * Save research results to files
     */
    private saveResults;
    /**
     * Display research results summary
     */
    private displayResultsSummary;
}
/**
 * Parameters for programmatic research execution
 */
export interface ResearchParams {
    company: string;
    industry: string;
    description?: string;
    goals?: string[];
    constraints?: string[];
    timeline?: string;
    keywords?: string[];
    urls?: string[];
    priorNotes?: string;
}
/**
 * Research execution result
 */
export interface ResearchResult {
    success: boolean;
    outputPath: string;
    dossier: any;
    sources: any[];
    meta: any;
}
//# sourceMappingURL=tui-research-agent.d.ts.map