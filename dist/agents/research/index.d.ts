export interface Dossier {
    summary: string;
    competitors: string[];
    constraints: string[];
    opportunities: string[];
    rawSources: string[];
    markdown: string;
}
/**
 * Mocks the webfetch tool to return a predefined research dossier for a fictional company 'Acme Corp'.
 * In a real scenario, this would orchestrate multiple webfetch calls based on the brief.
 * @param brief The client brief for the research.
 * @returns A structured Research Dossier.
 */
export declare function gatherDossier(brief: string): Promise<Dossier>;
//# sourceMappingURL=index.d.ts.map