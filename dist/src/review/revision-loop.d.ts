import { Reviewer } from './reviewer';
import { Rubric } from '../types/review';
import { PolicyEngine } from '../governance/policy-engine';
export declare class RevisionLoop {
    private reviewers;
    private policyEngine;
    constructor(reviewers: Reviewer[], policyEngine: PolicyEngine);
    runReview(gateId: string, content: any, rubric: Rubric): Promise<boolean>;
}
//# sourceMappingURL=revision-loop.d.ts.map