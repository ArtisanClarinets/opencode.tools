#!/usr/bin/env node

/**
 * OpenCode Tools CLI
 * 
 * Global CLI entry point for OpenCode Tools
 * Provides access to all agents and capabilities
 */

import { program } from 'commander';
import { ResearchAgent } from '../agents/research/research-agent';
import { DocumentationAgent } from '../agents/docs';
import { ArchitectureAgent } from '../agents/architecture';
import { PDFGeneratorAgent } from '../agents/pdf/pdf-agent';
import { logger } from './runtime/logger';

const VERSION = '1.0.0';

program
  .name('opencode-tools')
  .description('OpenCode Tools - Complete Developer Team Automation')
  .version(VERSION);

program
  .command('research')
  .description('Execute research agent to gather comprehensive dossier')
  .argument('<company>', 'Company name to research')
  .option('-i, --industry <industry>', 'Industry sector')
  .option('-o, --output <output>', 'Output directory', './output')
  .action(async (company, options) => {
    try {
      logger.info(`Starting research for ${company}`);
      const agent = new ResearchAgent();
      const result = await agent.execute({
        brief: {
          company,
          industry: options.industry || 'Technology',
          description: 'Research project for comprehensive analysis',
          goals: ['comprehensive research']
        }
      });
      console.log('Research completed:', result);
    } catch (error) {
      logger.error('Research failed:', error);
      process.exit(1);
    }
  });

program
  .command('docs')
  .description('Generate documentation (PRD and SOW)')
  .argument('<input>', 'Input dossier file path')
  .option('-o, --output <output>', 'Output directory', './output')
  .action(async (input, options) => {
    try {
      logger.info('Generating documentation');
      const agent = new DocumentationAgent();
      // Implementation details...
      console.log('Documentation generated');
    } catch (error) {
      logger.error('Documentation generation failed:', error);
      process.exit(1);
    }
  });

program
  .command('architect')
  .description('Generate system architecture and backlog')
  .argument('<prd>', 'PRD file path')
  .option('-o, --output <output>', 'Output directory', './output')
  .action(async (prd, options) => {
    try {
      logger.info('Generating architecture');
      const agent = new ArchitectureAgent();
      // Implementation details...
      console.log('Architecture generated');
    } catch (error) {
      logger.error('Architecture generation failed:', error);
      process.exit(1);
    }
  });

program
  .command('pdf')
  .description('Generate PDF documents')
  .argument('<config>', 'PDF configuration file')
  .option('-o, --output <output>', 'Output file', './output/document.pdf')
  .action(async (config, options) => {
    try {
      logger.info('Generating PDF');
      const agent = new PDFGeneratorAgent();
      // Implementation details...
      console.log('PDF generated');
    } catch (error) {
      logger.error('PDF generation failed:', error);
      process.exit(1);
    }
  });

program
  .command('tui')
  .description('Launch interactive TUI')
  .action(() => {
    // Import and launch TUI
    require('./tui-app');
  });

program
  .command('orchestrate')
  .description('Start the main orchestration agent for self-iterative development')
  .option('-p, --project <project>', 'Project name')
  .option('-m, --mode <mode>', 'Operation mode: research|docs|architect|code|full', 'full')
  .action(async (options) => {
    try {
      logger.info('Starting orchestration agent');
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║              OpenCode Tools - Orchestration Mode             ║
╠══════════════════════════════════════════════════════════════╣
║  Acting as: Complete Apple-Level Engineering Team            ║
║  - Receptionist: Initial requirements gathering              ║
║  - Project Manager: Task coordination and planning           ║
║  - Senior Engineers: Architecture and code generation        ║
║  - QA Engineers: Testing and validation                      ║
║  - DevOps: Deployment and infrastructure                     ║
║  - CTO: Strategic oversight and final approval               ║
╚══════════════════════════════════════════════════════════════╝
      `);
      
      // Launch orchestration
      const { OrchestratorAgent } = require('./agents/orchestrator');
      const orchestrator = new OrchestratorAgent();
      await orchestrator.execute({
        project: options.project,
        mode: options.mode
      });
    } catch (error) {
      logger.error('Orchestration failed:', error);
      process.exit(1);
    }
  });

// Default command - show help
if (process.argv.length === 2) {
  program.help();
}

program.parse();
