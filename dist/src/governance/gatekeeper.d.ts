import { Source } from '../../agents/research/types';
export interface GatekeeperResult {
    passed: boolean;
    score: number;
    reasons: string[];
}
export declare class ResearchGatekeeper {
    private minSources;
    private minDomains;
    constructor(minSources?: number, minDomains?: number);
    evaluate(sources: Source[]): GatekeeperResult;
}
//# sourceMappingURL=gatekeeper.d.ts.map