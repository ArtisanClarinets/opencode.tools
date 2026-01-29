import { ResearchInput, ResearchOutput } from './types';
import { Database } from '../../src/database/types';
import { ResearchGatekeeper } from '../../src/governance/gatekeeper';
export declare class ResearchError extends Error {
    context?: Record<string, any> | undefined;
    constructor(message: string, context?: Record<string, any> | undefined);
}
export declare class ResearchAgent {
    private readonly agentName;
    private readonly promptVersion;
    private readonly mcpVersion;
    private db;
    private gatekeeper;
    constructor(db?: Database, gatekeeper?: ResearchGatekeeper);
    execute(input: ResearchInput): Promise<ResearchOutput>;
    private generateRunId;
    private gatherCompanyData;
    private gatherIndustryData;
    private gatherCompetitorData;
    private gatherTechStackData;
    private searchWeb;
    private extractCompetitors;
    private extractTechStack;
    private mergeTechStack;
    private generateCompanySummary;
    private generateIndustryOverview;
    private identifyRisks;
    private identifyOpportunities;
    private generateRecommendations;
    private compileSources;
}
//# sourceMappingURL=research-agent.d.ts.map