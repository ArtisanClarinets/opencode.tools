/**
 * Orchestrator Agent
 * 
 * Main orchestration agent that coordinates all sub-agents
 * in self-iterative loops for complete project development.
 */

import { logger } from '../../src/runtime/logger';
import { ResearchAgent } from '../../agents/research/research-agent';
import { DocumentationAgent } from '../../agents/docs';
import { ArchitectureAgent } from '../../agents/architecture';

export interface OrchestratorInput {
  project?: string;
  mode?: 'research' | 'docs' | 'architect' | 'code' | 'full';
  iterations?: number;
}

export interface OrchestratorOutput {
  success: boolean;
  phases: PhaseResult[];
  artifacts: Record<string, unknown>;
}

export interface PhaseResult {
  phase: string;
  status: 'success' | 'failure' | 'in-progress';
  output?: unknown;
  errors?: string[];
}

export class OrchestratorAgent {
  private phases: PhaseResult[] = [];
  private artifacts: Record<string, unknown> = {};

  async execute(input: OrchestratorInput): Promise<OrchestratorOutput> {
    const { project = 'unnamed-project', mode = 'full' } = input;
    
    logger.info('Orchestrator starting', { project, mode });

    try {
      // Phase 1: Research
      if (mode === 'full' || mode === 'research') {
        await this.runPhase('research', async () => {
          logger.info('Phase 1: Research - Gathering comprehensive dossier');
          const agent = new ResearchAgent();
          const result = await agent.execute({
            brief: {
              company: project,
              industry: 'Technology',
              description: 'Research project for comprehensive analysis',
              goals: ['comprehensive research', 'competitor analysis']
            }
          });
          this.artifacts.research = result;
          return result;
        });
      }

      // Phase 2: Documentation
      if (mode === 'full' || mode === 'docs') {
        await this.runPhase('documentation', async () => {
          logger.info('Phase 2: Documentation - Generating PRD and SOW');
          if (!this.artifacts.research) {
            throw new Error('Research phase must complete before documentation');
          }
          const agent = new DocumentationAgent();
          const result = await agent.generateDocuments(
            this.artifacts.research as any,
            'Generate comprehensive documentation'
          );
          this.artifacts.prd = result.prd;
          this.artifacts.sow = result.sow;
          return result;
        });
      }

      // Phase 3: Architecture
      if (mode === 'full' || mode === 'architect') {
        await this.runPhase('architecture', async () => {
          logger.info('Phase 3: Architecture - Designing system and backlog');
          const agent = new ArchitectureAgent();
          const result = await agent.execute({
            prd_content: this.artifacts.prd as string || 'No PRD available'
          });
          this.artifacts.architecture = result;
          return result;
        });
      }

      logger.info('Orchestration completed successfully');

      return {
        success: true,
        phases: this.phases,
        artifacts: this.artifacts
      };
    } catch (error) {
      logger.error('Orchestration failed:', error);
      return {
        success: false,
        phases: this.phases,
        artifacts: this.artifacts
      };
    }
  }

  private async runPhase(phaseName: string, action: () => Promise<unknown>): Promise<void> {
    const phase: PhaseResult = {
      phase: phaseName,
      status: 'in-progress'
    };
    this.phases.push(phase);

    try {
      const output = await action();
      phase.status = 'success';
      phase.output = output;
      logger.info(`Phase ${phaseName} completed successfully`);
    } catch (error) {
      phase.status = 'failure';
      phase.errors = [error instanceof Error ? error.message : 'Unknown error'];
      logger.error(`Phase ${phaseName} failed:`, error);
      throw error;
    }
  }
}

export default OrchestratorAgent;
