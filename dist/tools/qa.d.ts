export interface TestCase {
    id: string;
    requirementId: string;
    description: string;
    steps: string[];
    expectedResult: string;
    type: 'functional' | 'security' | 'performance' | 'availability';
}
export interface RiskItem {
    id: string;
    impact: 'high' | 'medium' | 'low';
    probability: 'high' | 'medium' | 'low';
    mitigation: string;
}
/**
 * C2: QA Agent: real test planning + verification
 * Generates a comprehensive test plan from PRD and acceptance criteria.
 */
export declare function generateTestPlan(prd: any, discoveryItems: any[]): Promise<{
    testPlan: TestCase[];
}>;
/**
 * Generates a risk-based testing matrix.
 */
export declare function generateRiskMatrix(discoveryItems: any[]): Promise<{
    riskMatrix: RiskItem[];
}>;
/**
 * Runs static analysis (eslint, typecheck).
 */
export declare function runStaticAnalysis(path: string): Promise<{
    success: boolean;
    violations: any[];
}>;
/**
 * Peer Review for QA artifacts.
 */
export declare function peerReview(qaArtifact: any): Promise<{
    notes: string;
    score: number;
}>;
//# sourceMappingURL=qa.d.ts.map