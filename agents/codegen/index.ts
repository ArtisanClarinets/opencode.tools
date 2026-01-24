import { IAgent, BacklogItem, ProjectScaffoldResult } from '../types';



export class CodeGenAgent implements IAgent {
    public async prototype(backlogItem: BacklogItem): Promise<ProjectScaffoldResult> {
        const { title, techStack } = backlogItem;

        // 1. Simulate reading the scaffolding guide (prompts/codegen/v1/scaffold.md)
        // In a real scenario, this would be a 'read' call.

        let log = `Starting scaffolding for: ${title} (${techStack})\n`;

        // 2. Simulate project scaffolding (using a guide)
        const mockFiles = [
            'src/index.ts',
            'src/user.controller.ts',
            'package.json',
            'tsconfig.json',
            'tests/user.test.ts'
        ];

        log += `\n[Simulating File Creation]\n`;
        log += `Created standard project structure and files: ${mockFiles.join(', ')}\n`;

        // 3. Simulate running external tools (git, test_runner via orchestrator)
        log += `\n[Simulating Tool Use: npm install]\n`;
        log += `> bash.execute('npm install...') -> Success: installed all dependencies.\n`;
        
        log += `\n[Simulating Tool Use: git commit]\n`;
        log += `> git.commit('Feat: Initial project scaffold for ${title}') -> Success: initial commit created.\n`;

        // 4. Return result
        return {
            success: true,
            log: log,
            filesCreated: mockFiles
        };
    }
}

// Mock export for testing
export const mockBacklogItem: BacklogItem = {
    id: 'FEAT-001',
    title: 'User Profile Service API',
    description: 'Build a REST API in Node/TypeScript for CRUD operations on user profiles.',
    techStack: 'Node.js/TypeScript'
};

// Example usage log
/*
const agent = new CodeGenAgent();
agent.prototype(mockBacklogItem).then(result => console.log(result.log));
*/
