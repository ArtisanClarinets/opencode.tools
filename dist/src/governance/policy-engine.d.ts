import { Gate, ReviewResult } from '../types/review';
import { RunStore } from '../runtime/run-store';
export declare class PolicyEngine {
    private runStore;
    private gates;
    private reviews;
    constructor(runStore: RunStore);
    registerGate(gate: Gate): void;
    submitReview(gateId: string, review: ReviewResult): void;
    checkGate(gateId: string): boolean;
}
//# sourceMappingURL=policy-engine.d.ts.map