"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TUIResearchAgent = void 0;
const phd_research_workflow_1 = require("../workflows/phd-research-workflow");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const readFile = (0, util_1.promisify)(fs.readFile);
const writeFile = (0, util_1.promisify)(fs.writeFile);
const mkdir = (0, util_1.promisify)(fs.mkdir);
/**
 * TUI-Integrated Research Agent
 * Accessible ONLY through OpenCode TUI - no standalone CLI
 */
class TUIResearchAgent {
    constructor() {
        this.artifactsDir = 'artifacts';
        this.workflow = new phd_research_workflow_1.PhdResearchWorkflow();
    }
    /**
     * Run research from TUI with interactive prompts
     */
    async runInteractive() {
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
        }
        catch (error) {
            console.error('❌ Research failed:', error.message);
            throw error;
        }
    }
    /**
     * Run research with predefined parameters (for TUI automation)
     */
    async runWithParams(params) {
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
    async gatherInput() {
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
    async tuiPrompt(message) {
        // This is a placeholder - in real TUI, this would use the TUI's prompt system
        return new Promise((resolve) => {
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question(message + ' ', (answer) => {
                rl.close();
                resolve(answer.trim());
            });
        });
    }
    /**
     * Convert parameters to ResearchInput
     */
    paramsToInput(params) {
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
    async saveResults(result, companyName) {
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
        await writeFile(`${basePath}-dossier.json`, JSON.stringify(result.dossier, null, 2));
        await writeFile(`${basePath}-sources.json`, JSON.stringify(result.sources, null, 2));
        await writeFile(`${basePath}-meta.json`, JSON.stringify(result.meta, null, 2));
        return basePath;
    }
    /**
     * Display research results summary
     */
    displayResultsSummary(result, outputPath) {
        if (result.approved) {
            console.log('\n✅ PhD Research Workflow completed successfully!');
        }
        else {
            console.log('\n⚠️ Research completed with Council warnings.');
        }
        console.log(`📁 Results saved to: ${outputPath}`);
        console.log('\n📊 Summary:');
        // Adapt to nested structure if result is PhdResearchResult, or ResearchOutput if called from saveResults which flattens it?
        // saveResults saves the whole object.
        // Check structure
        const dossier = result.research ? result.research.dossier : result.dossier;
        const sources = result.research ? result.research.sources : result.sources;
        const meta = result.research ? result.research.meta : result.meta;
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
            council.results.forEach((r) => {
                console.log(`   • ${r.reviewerId}: ${r.passed ? '✅' : '❌'} (${r.comments})`);
            });
        }
        if (meta) {
            console.log(`\nℹ️  Metadata:`);
            console.log(`   • Run ID: ${meta.runId}`);
        }
    }
}
exports.TUIResearchAgent = TUIResearchAgent;
//# sourceMappingURL=tui-research-agent.js.map