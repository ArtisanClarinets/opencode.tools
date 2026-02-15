import { CoworkOrchestrator } from '../cowork/orchestrator/cowork-orchestrator';
import { CommandRegistry } from '../cowork/registries/command-registry';
import { AgentRegistry } from '../cowork/registries/agent-registry';
import { loadAllPlugins, loadNativeAgents } from '../cowork/plugin-loader';
import type { AgentResult } from '../cowork/orchestrator/result-merger';

const ROLE_TO_AGENT: Record<string, string> = {
  CTO_ORCHESTRATOR: 'architect',
  PRODUCT_MANAGER: 'pm',
  STAFF_BACKEND_ENGINEER: 'implementer',
  STAFF_FRONTEND_ENGINEER: 'implementer',
  QA_LEAD: 'qa',
  SECURITY_LEAD: 'security',
  TECH_WRITER: 'docs',
  SRE_DEVOPS: 'performance',
};

export class FoundryCoworkBridge {
  private readonly orchestrator: CoworkOrchestrator;
  private initialized = false;

  constructor(orchestrator?: CoworkOrchestrator) {
    this.orchestrator = orchestrator || new CoworkOrchestrator();
  }

  public initialize(): void {
    if (this.initialized) {
      return;
    }

    const commandRegistry = CommandRegistry.getInstance();
    const agentRegistry = AgentRegistry.getInstance();

    const plugins = loadAllPlugins();
    for (const plugin of plugins) {
      commandRegistry.registerMany(plugin.commands);
      agentRegistry.registerMany(plugin.agents);
    }

    const nativeAgents = loadNativeAgents();
    agentRegistry.registerMany(nativeAgents);

    this.initialized = true;
  }

  public getAgentIdForRole(roleId: string): string | null {
    return ROLE_TO_AGENT[roleId] || null;
  }

  public hasAgentForRole(roleId: string): boolean {
    this.initialize();
    const agentId = this.getAgentIdForRole(roleId);
    if (!agentId) {
      return false;
    }

    return AgentRegistry.getInstance().has(agentId);
  }

  public async dispatchRoleTask(
    roleId: string,
    task: string,
    context?: Record<string, unknown>,
  ): Promise<AgentResult | null> {
    this.initialize();

    const agentId = this.getAgentIdForRole(roleId);
    if (!agentId || !AgentRegistry.getInstance().has(agentId)) {
      return null;
    }

    return this.orchestrator.spawnAgent(agentId, task, context);
  }

  public async runCommand(commandId: string, args: string[]): Promise<unknown> {
    this.initialize();
    return this.orchestrator.execute(commandId, args);
  }
}
