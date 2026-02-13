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
const tui_architecture_agent_1 = require("./tui-agents/tui-architecture-agent");
const tui_codegen_agent_1 = require("./tui-agents/tui-codegen-agent");
const child_process_1 = require("child_process");
const discovery_1 = require("./plugins/discovery");
const plugin_loader_1 = require("./cowork/plugin-loader");
const command_registry_1 = require("./cowork/registries/command-registry");
const agent_registry_1 = require("./cowork/registries/agent-registry");
const cowork_orchestrator_1 = require("./cowork/orchestrator/cowork-orchestrator");
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
    // Register Architecture Agent
    tools.push({
        id: 'architecture-agent',
        name: 'Architecture Agent',
        description: 'System design and backlog generation',
        category: 'documentation',
        handler: async () => {
            const agent = new tui_architecture_agent_1.TUIArchitectureAgent();
            await agent.runInteractive();
            return { success: true };
        }
    });
    // Register CodeGen Agent
    tools.push({
        id: 'codegen-agent',
        name: 'CodeGen Agent',
        description: 'Feature scaffolding and code generation',
        category: 'codegen',
        handler: async () => {
            const agent = new tui_codegen_agent_1.TUICodeGenAgent();
            await agent.runInteractive();
            return { success: true };
        }
    });
    // Discover bundled plugin manifests and register them as TUI tools (read-only discovery)
    const manifests = (0, discovery_1.discoverBundledPlugins)();
    for (const manifest of manifests) {
        try {
            const toolId = manifest.id || `plugin:${manifest.name}`;
            const toolName = manifest.name || toolId;
            const description = `Plugin adapterType=${manifest.adapterType} capabilities=${(manifest.capabilities || []).join(', ')} license=${manifest.license || 'unknown'}`;
            tools.push({
                id: toolId,
                name: toolName,
                description,
                category: 'research',
                handler: async (args) => {
                    // By default return manifest metadata. To execute the plugin set args.run = true
                    if (!args || !args.run) {
                        return { manifest };
                    }
                    // Execution requested - run the entryPoint.cmd if provided (best-effort)
                    const cmd = manifest.entryPoint?.cmd || [];
                    if (!Array.isArray(cmd) || cmd.length === 0) {
                        throw new Error('No executable command declared in plugin manifest');
                    }
                    const child = (0, child_process_1.spawn)(cmd[0], cmd.slice(1), { stdio: ['pipe', 'pipe', 'pipe'] });
                    let stdout = '';
                    let stderr = '';
                    child.stdout.on('data', d => (stdout += d.toString()));
                    child.stderr.on('data', d => (stderr += d.toString()));
                    const exitCode = await new Promise((resolve) => child.on('close', resolve));
                    if (exitCode !== 0) {
                        throw new Error(`Plugin process exited with code=${exitCode} stderr=${stderr}`);
                    }
                    // Try parsing JSON output, otherwise return raw stdout
                    try {
                        return JSON.parse(stdout);
                    }
                    catch (err) {
                        return { stdout, stderr };
                    }
                }
            });
        }
        catch (err) {
            // ignore malformed manifest
        }
    }
    // ============================================================
    // Cowork Plugin System
    // ============================================================
    // Load Cowork plugins and register commands/agents
    try {
        const plugins = (0, plugin_loader_1.loadAllPlugins)();
        const commandRegistry = command_registry_1.CommandRegistry.getInstance();
        const agentRegistry = agent_registry_1.AgentRegistry.getInstance();
        // Register plugins with registries
        for (const plugin of plugins) {
            commandRegistry.registerMany(plugin.commands);
            agentRegistry.registerMany(plugin.agents);
        }
        // Register Cowork commands as TUI tools
        const commands = commandRegistry.list();
        for (const cmd of commands) {
            tools.push({
                id: `cowork:command:${cmd.id}`,
                name: cmd.name,
                description: cmd.description,
                category: 'cowork',
                handler: async (args) => {
                    const orchestrator = new cowork_orchestrator_1.CoworkOrchestrator();
                    return await orchestrator.execute(cmd.id, args._ ?? []);
                },
                parameters: [
                    {
                        name: 'args',
                        type: 'array',
                        required: false,
                        description: cmd.argumentHint || 'Command arguments'
                    }
                ]
            });
        }
        // Register Cowork agents as TUI tools
        const agents = agentRegistry.list();
        for (const agent of agents) {
            tools.push({
                id: `cowork:agent:${agent.id}`,
                name: agent.name,
                description: agent.description,
                category: 'cowork',
                handler: async (args) => {
                    const orchestrator = new cowork_orchestrator_1.CoworkOrchestrator();
                    return await orchestrator.spawnAgent(agent.id, args.task || 'Execute agent task', args.context);
                },
                parameters: [
                    {
                        name: 'task',
                        type: 'string',
                        required: true,
                        description: 'Task prompt for the agent'
                    },
                    {
                        name: 'context',
                        type: 'array',
                        required: false,
                        description: 'Additional context data'
                    }
                ]
            });
        }
    }
    catch (err) {
        console.warn('Failed to load Cowork plugins:', err);
    }
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