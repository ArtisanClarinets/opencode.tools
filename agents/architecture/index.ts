// agents/architecture/index.ts

/**
 * Mocks the output structure of the Architecture Agent.
 * In a real implementation, this would involve calling the LLM with the prompt
 * and the PRD/SOW content, and parsing the resulting JSON.
 * 
 * @param prd_sow_content The mock PRD or SOW content.
 * @returns A structured object containing the architecture diagram (Mermaid) and the backlog.
 */
export function generateArchitecture(prd_sow_content: string) {
    // --- Mock Data Generation for Prototype ---
    
    // 1. Mock Architecture Diagram (Mermaid)
    const architectureDiagram = `graph TD
    A[Client Request] --> B(Docs Agent);
    B --> C(Architecture Agent);
    C --> D{Backlog and Design};
    D --> E[Code Agent];
    E --> F(Delivery Handoff);
    style A fill:#f9f,stroke:#333;
    style C fill:#ccf,stroke:#333,stroke-width:2px;
    classDef main fill:#f96,stroke:#333;
    class A,B,C,D,E,F main;
    `;

    // 2. Mock Backlog
    const backlog = {
        epics: [
            {
                id: "EPIC-1",
                title: "Agent Core System Infrastructure",
                description: "Establish the foundation for the agent-driven tooling.",
                stories: [
                    {
                        id: "STORY-1.1",
                        title: "Setup Monorepo Structure",
                        acceptanceCriteria: ["Repository has a clean, organized structure for agents and tools."]
                    },
                    {
                        id: "STORY-1.2",
                        title: "Implement MCP Configuration Loading",
                        acceptanceCriteria: ["MCP files are loaded correctly by the agent orchestrator."]
                    }
                ]
            },
            {
                id: "EPIC-2",
                title: "Architecture Agent Logic",
                description: "Implement the core functionality for architecture and backlog generation.",
                stories: [
                    {
                        id: "STORY-2.1",
                        title: "Generate Mermaid Diagram from PRD/SOW",
                        acceptanceCriteria: ["Architecture Agent successfully outputs a valid Mermaid string."]
                    },
                    {
                        id: "STORY-2.2",
                        title: "Structure Backlog into Epics/Stories",
                        acceptanceCriteria: ["The agent's output adheres to the required JSON backlog format."]
                    }
                ]
            }
        ]
    };

    // 3. Mock PRD/SOW consumption (just for demonstration, not used in the mock logic)
    console.log(\`Architecture generation triggered for PRD/SOW content: \${prd_sow_content.substring(0, 50)}...\`);

    return {
        architectureDiagram,
        backlog,
    };
}