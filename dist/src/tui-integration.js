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
exports.TUIResearchAgentExtended = void 0;
exports.registerTUITools = registerTUITools;
const tui_agents_1 = require("./tui-agents");
/**
 * Register TUI tools with OpenCode
 */
function registerTUITools() {
    const tools = [];
    // Register Research Agent
    tools.push({
        id: 'research-agent',
        name: 'Research Agent',
        description: 'Automated client and industry research with competitor analysis',
        category: 'research',
        handler: async (args) => {
            const agent = new TUIResearchAgentExtended();
            if (args.mode === 'interactive') {
                await agent.runInteractive();
                return { success: true, message: 'Research completed interactively' };
            }
            else if (args.mode === 'brief' && args.briefPath) {
                return await agent.runWithBriefFile(args.briefPath, args.outputPath);
            }
            else if (args.mode === 'quick' && args.company && args.industry) {
                const params = {
                    company: args.company,
                    industry: args.industry,
                    description: args.description,
                    goals: args.goals,
                    constraints: args.constraints,
                    timeline: args.timeline,
                    keywords: args.keywords
                };
                return await agent.runWithParams(params);
            }
            else {
                throw new Error('Invalid research parameters');
            }
        },
        parameters: [
            {
                name: 'mode',
                type: 'string',
                required: true,
                description: 'Research mode: interactive, brief, or quick',
                default: 'interactive'
            }
        ]
    });
    return tools;
}
/**
 * Extended TUI Research Agent with file support
 */
class TUIResearchAgentExtended extends tui_agents_1.TUIResearchAgent {
    /**
     * Run research from a brief file (TUI-accessible)
     */
    async runWithBriefFile(briefPath, outputPath) {
        const briefContent = await Promise.resolve().then(() => __importStar(require('fs'))).then(fs => fs.promises.readFile(briefPath, 'utf-8'));
        const brief = JSON.parse(briefContent);
        const params = {
            company: brief.company,
            industry: brief.industry,
            description: brief.description,
            goals: brief.goals,
            constraints: brief.constraints,
            timeline: brief.timeline,
            keywords: brief.keywords,
            urls: brief.urls,
            priorNotes: brief.priorNotes
        };
        return this.runWithParams(params);
    }
    /**
     * Run research with parameters (TUI-accessible)
     */
    async runWithParams(params) {
        return super.runWithParams(params);
    }
}
exports.TUIResearchAgentExtended = TUIResearchAgentExtended;
//# sourceMappingURL=tui-integration.js.map