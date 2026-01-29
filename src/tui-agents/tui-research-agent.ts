import { PhdResearchWorkflow, PhdResearchResult } from '../workflows/phd-research-workflow';
import { ResearchInput } from '../../agents/research/types';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { promisify } from 'util';
import { ReviewResult } from '../types/review';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

/**
 * TUI-Integrated Research Agent
 * Accessible ONLY through OpenCode TUI - no standalone CLI
 */
export class TUIResearchAgent {
  private workflow: PhdResearchWorkflow;
  private readonly artifactsDir = 'artifacts';

  constructor() {
    this.workflow = new PhdResearchWorkflow();
  }

  /**
   * Run research from TUI with interactive prompts
   */
  async runInteractive(): Promise<void> {
    console.log('\n🔍 OpenCode PhD Research Agent');
    console.log('============================');
    
    try {
      // Get research parameters through TUI prompts
      const input = await this.gatherInput();
      
      console.log('\n🚀 Starting PhD research workflow...');
      console.log(`🏢 Company: ${input.brief.company}`);
      console.log(`🏭 Industry: ${input.brief.industry}`);
      
      // Execute research workflow
      const result = await this.workflow.execute(input);
      
      // Save results
      const outputPath = await this.saveResults(result, input.brief.company);
      
      // Display summary
      this.displayResultsSummary(result, outputPath);
      
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Research failed:', err.message);
      throw err;
    }
  }

  /**
   * Run research with predefined parameters (for TUI automation)
   */
  async runWithParams(params: ResearchParams): Promise<ResearchResult> {
    const input = this.paramsToInput(params);
    
    console.log(`🔍 Researching ${input.brief.company}...`);
    
    const result = await this.workflow.execute(input);
    const outputPath = await this.saveResults(result, input.brief.company);
    
    return {
      success: result.approved,
      outputPath,
      dossier: result.research.dossier,
      sources: result.research.sources,
      meta: result.research.meta
    };
  }

  /**
   * Gather input through TUI prompts
   */
  private async gatherInput(): Promise<ResearchInput> {
    // This would integrate with the actual TUI prompt system
    // For now, using console prompts that can be replaced with TUI equivalents
    
    const company = await this.tuiPrompt('Company name:');
    const industry = await this.tuiPrompt('Industry:');
    const description = await this.tuiPrompt('Company description (optional):');
    const goals = await this.tuiPrompt('Goals (comma-separated):');
    const constraints = await this.tuiPrompt('Constraints (comma-separated, optional):');
    const timeline = await this.tuiPrompt('Timeline (optional):');
    const keywords = await this.tuiPrompt('Keywords (comma-separated, optional):');
    
    return {
      brief: {
        company: company || 'Unknown Company',
        industry: industry || 'Unknown Industry',
        description: description || `${company} operates in the ${industry} industry.`,
        goals: goals ? goals.split(',').map(g => g.trim()) : ['Market research'],
        constraints: constraints ? constraints.split(',').map(c => c.trim()) : [],
        timeline: timeline || 'Not specified'
      },
      keywords: keywords ? keywords.split(',').map(k => k.trim()) : [],
      urls: [],
      priorNotes: ''
    };
  }

  /**
   * TUI-compatible prompt (can be replaced with actual TUI prompts)
   */
  private async tuiPrompt(message: string): Promise<string> {
    // This is a placeholder - in real TUI, this would use the TUI's prompt system
    return new Promise((resolve) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question(message + ' ', (answer: string) => {
        rl.close();
        resolve(answer.trim());
      });
    });
  }

  /**
   * Convert parameters to ResearchInput
   */
  private paramsToInput(params: ResearchParams): ResearchInput {
    return {
      brief: {
        company: params.company,
        industry: params.industry,
        description: params.description || `${params.company} operates in the ${params.industry} industry.`,
        goals: params.goals || ['Market research'],
        constraints: params.constraints || [],
        timeline: params.timeline || 'Not specified'
      },
      keywords: params.keywords || [],
      urls: params.urls || [],
      priorNotes: params.priorNotes || ''
    };
  }

  /**
   * Save research results to files
   */
  private async saveResults(result: PhdResearchResult, companyName: string): Promise<string> {
    // Ensure artifacts directory exists
    if (!fs.existsSync(this.artifactsDir)) {
      await mkdir(this.artifactsDir, { recursive: true });
    }
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
    const baseName = `${safeCompanyName}-research-${timestamp}`;
    const basePath = path.join(this.artifactsDir, baseName);
    
    // Save complete result
    await writeFile(`${basePath}.json`, JSON.stringify(result, null, 2));
    
    // Save individual components
    await writeFile(`${basePath}-dossier.json`, JSON.stringify(result.research.dossier, null, 2));
    await writeFile(`${basePath}-sources.json`, JSON.stringify(result.research.sources, null, 2));
    await writeFile(`${basePath}-meta.json`, JSON.stringify(result.research.meta, null, 2));
    
    return basePath;
  }

  /**
   * Display research results summary
   */
  private displayResultsSummary(result: PhdResearchResult, outputPath: string): void {
    if (result.approved) {
        console.log('\n✅ PhD Research Workflow completed successfully!');
    } else {
        console.log('\n⚠️ Research completed with Council warnings.');
    }

    console.log(`📁 Results saved to: ${outputPath}`);
    console.log('\n📊 Summary:');

    const dossier = result.research.dossier;
    const sources = result.research.sources;
    const meta = result.research.meta;
    const council = result.councilReview;
    const summary = result.summary;

    console.log(`   • Company: ${dossier.companySummary.substring(0, 80)}...`);
    console.log(`   • Industry: ${dossier.industryOverview.substring(0, 80)}...`);
    console.log(`   • Sources Cited: ${sources.length}`);
    
    if (summary) {
        console.log(`   • Executive Summary Generated: Yes`);
    }

    if (council) {
        console.log('\n🏛️  Council Review:');
        console.log(`   • Approved: ${council.approved ? 'Yes' : 'No'}`);
        council.results.forEach((r: ReviewResult) => {
            console.log(`   • ${r.reviewerId}: ${r.passed ? '✅' : '❌'} (${r.comments})`);
        });
    }

    if (meta) {
      console.log(`\nℹ️  Metadata:`);
      console.log(`   • Run ID: ${meta.runId}`);
    }
  }
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
  dossier: unknown;
  sources: unknown[];
  meta: unknown;
}