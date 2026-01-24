/**
 * Mocks the output structure of the Architecture Agent.
 * In a real implementation, this would involve calling the LLM with the prompt
 * and the PRD/SOW content, and parsing the resulting JSON.
 *
 * @param prd_sow_content The mock PRD or SOW content.
 * @returns A structured object containing the architecture diagram (Mermaid) and the backlog.
 */
export declare function generateArchitecture(prd_sow_content: string): {
    architectureDiagram: string;
    backlog: {
        epics: {
            id: string;
            title: string;
            description: string;
            stories: {
                id: string;
                title: string;
                acceptanceCriteria: string[];
            }[];
        }[];
    };
};
//# sourceMappingURL=index.d.ts.map