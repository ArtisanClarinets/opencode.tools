import { AgentDefinition } from '../types';
import { PhdResearchWorkflow } from '../../workflows/phd-research-workflow';
import { ArchitectureAgent } from '../../../agents/architecture';
import { CodeGenAgent } from '../../../agents/codegen';
import { OrchestratorAgent } from '../../agents/orchestrator';
import { logger } from '../../runtime/logger';
import * as fs from 'fs';
import * as path from 'path';

// Helper to save results (mimicking TUIResearchAgent)
const saveResearchResults = async (result: any, companyName: string) => {
    const artifactsDir = 'artifacts';
    if (!fs.existsSync(artifactsDir)) {
      try {
        fs.mkdirSync(artifactsDir, { recursive: true });
      } catch (e) {}
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
    const baseName = `${safeCompanyName}-research-${timestamp}`;
    const basePath = path.join(artifactsDir, baseName);

    fs.writeFileSync(`${basePath}.json`, JSON.stringify(result, null, 2));
    if (result.research) {
        fs.writeFileSync(`${basePath}-dossier.json`, JSON.stringify(result.research.dossier, null, 2));
    }
    return basePath;
};

export const AGENTS: AgentDefinition[] = [
  {
    id: 'orchestrator',
    name: 'Cowork Orchestrator',
    description: 'Complete Apple-Level Engineering Team',
    interactive: true,
    steps: [
      { key: 'intent', question: 'What do you want to build? (CEO Intent):', type: 'text', required: true }
    ],
    execute: async (answers, log) => {
        log('Initializing Cowork Orchestrator (CTO Mode)...');
        const agent = new OrchestratorAgent();

        const originalLog = console.log;
        const originalError = console.error;
        
        // Patch global logger to capture agent output
        const originalLoggerInfo = logger.info;
        const originalLoggerError = logger.error;
        const originalLoggerWarn = logger.warn;

        // Create a wrapper that logs to TUI and original logger
        logger.info = ((message: any, ...meta: any[]) => {
            log(String(message));
            return (originalLoggerInfo as Function).apply(logger, [message, ...meta]);
        }) as any;
        logger.error = ((message: any, ...meta: any[]) => {
            log(`ERROR: ${String(message)}`);
            return (originalLoggerError as Function).apply(logger, [message, ...meta]);
        }) as any;
        logger.warn = ((message: any, ...meta: any[]) => {
            log(`WARN: ${String(message)}`);
            return (originalLoggerWarn as Function).apply(logger, [message, ...meta]);
        }) as any;

        try {
            console.log = (...args) => log(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
            console.error = (...args) => log(`ERROR: ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`);
            
            log(`CEO Intent Received: ${answers.intent}`);
            
            const result = await agent.execute({
                project: 'Automated Project',
                intent: answers.intent,
                mode: 'full'
            });

            if (result.success) {
                log('✅ Project lifecycle completed.');
            } else {
                log('⚠️ Project lifecycle encountered issues.');
            }
            return result;
        } finally {
            console.log = originalLog;
            console.error = originalError;
            
            // Restore logger
            logger.info = originalLoggerInfo;
            logger.error = originalLoggerError;
            logger.warn = originalLoggerWarn;
        }
    }
  },
  {
    id: 'research',
    name: 'PhD Research Agent',
    description: 'Automated client and industry research',
    steps: [
      { key: 'company', question: 'What is the Company Name?', type: 'text', required: true },
      { key: 'industry', question: 'What Industry is it in?', type: 'text', required: true },
      { key: 'description', question: 'Brief Description (optional):', type: 'text' },
      { key: 'goals', question: 'Goals (comma-separated):', type: 'text' },
      { key: 'constraints', question: 'Constraints (comma-separated):', type: 'text' },
      { key: 'timeline', question: 'Timeline:', type: 'text' },
      { key: 'keywords', question: 'Keywords (comma-separated):', type: 'text' },
    ],
    execute: async (answers, log) => {
      log('Initializing Research Workflow...');
      const workflow = new PhdResearchWorkflow();

      const input = {
        brief: {
          company: answers.company,
          industry: answers.industry,
          description: answers.description || `${answers.company} operates in the ${answers.industry} industry.`,
          goals: answers.goals ? answers.goals.split(',').map((s: string) => s.trim()) : ['Market research'],
          constraints: answers.constraints ? answers.constraints.split(',').map((s: string) => s.trim()) : [],
          timeline: answers.timeline || 'Not specified'
        },
        keywords: answers.keywords ? answers.keywords.split(',').map((s: string) => s.trim()) : [],
        urls: [],
        priorNotes: ''
      };

      log(`Starting research for ${input.brief.company}...`);

      const originalLog = console.log;
      const originalError = console.error;

      try {
          console.log = (...args) => {
              log(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
          };
          console.error = (...args) => {
              log(`ERROR: ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`);
          };

          const result = await workflow.execute(input);

          log('Research completed.');
          const savedPath = await saveResearchResults(result, input.brief.company);
          log(`Results saved to: ${savedPath}`);

          if (result.approved) {
              log('✅ Research approved by Council.');
          } else {
              log('⚠️ Research completed with warnings.');
          }

          return result;
      } finally {
          console.log = originalLog;
          console.error = originalError;
      }
    }
  },
  {
    id: 'architecture',
    name: 'Architecture Agent',
    description: 'System design from PRD',
    steps: [
      { key: 'prdPath', question: 'Path to PRD (markdown file):', type: 'text', required: true }
    ],
    execute: async (answers, log) => {
        log('Initializing Architecture Agent...');
        const agent = new ArchitectureAgent();

        if (!fs.existsSync(answers.prdPath)) {
            throw new Error(`File not found: ${answers.prdPath}`);
        }

        const prdContent = fs.readFileSync(answers.prdPath, 'utf-8');
        log(`Loaded PRD from ${answers.prdPath} (${prdContent.length} chars).`);

        const originalLog = console.log;
        const originalError = console.error;
        try {
            console.log = (...args) => log(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
            console.error = (...args) => log(`ERROR: ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`);

            const result = await agent.execute({ prd_content: prdContent });

            log('Architecture design completed.');

            const artifactsDir = 'artifacts/architecture';
            if (!fs.existsSync(artifactsDir)) {
                try { fs.mkdirSync(artifactsDir, { recursive: true }); } catch (e) {}
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const baseName = path.basename(answers.prdPath, '.md');
            const outPath = path.join(artifactsDir, `${baseName}-architecture-${timestamp}`);

            fs.writeFileSync(`${outPath}-diagram.mmd`, result.architectureDiagram);
            fs.writeFileSync(`${outPath}-backlog.json`, JSON.stringify(result.backlog, null, 2));

            log(`Saved diagram to ${outPath}-diagram.mmd`);
            return result;
        } finally {
            console.log = originalLog;
            console.error = originalError;
        }
    }
  },
  {
    id: 'codegen',
    name: 'CodeGen Agent',
    description: 'Scaffold features',
    steps: [
      { key: 'title', question: 'Feature Title:', type: 'text', required: true },
      { key: 'techStack', question: 'Tech Stack:', type: 'text', required: true }
    ],
    execute: async (answers, log) => {
        log('Initializing CodeGen Agent...');
        const agent = new CodeGenAgent();

        const originalLog = console.log;
        const originalError = console.error;
        try {
            console.log = (...args) => log(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
            console.error = (...args) => log(`ERROR: ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')}`);

            // Fix: prototype method signature requires id, title, description, techStack
            // Checking agents/codegen/index.ts: public async prototype(backlogItem: BacklogItem): Promise<ProjectScaffoldResult>
            // BacklogItem has id, title, description, techStack (from ../types)
            // But we don't have types here.

            const result = await agent.prototype({
                id: 'TUI-RUN',
                title: answers.title,
                description: 'Generated via OpenCode TUI',
                techStack: answers.techStack
            });

            log('Scaffolding completed.');
            log(`Files created: ${result.filesCreated.join(', ')}`);
            return result;
        } finally {
             console.log = originalLog;
             console.error = originalError;
        }
    }
  }
];
