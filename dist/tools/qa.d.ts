export interface TestCase {
    id: string;
    requirementId: string;
    description: string;
    steps: string[];
    expectedResult: string;
    type: 'functional' | 'security' | 'performance' | 'availability';
    priority: 'critical' | 'high' | 'medium' | 'low';
}
export interface RiskItem {
    id: string;
    description: string;
    impact: 'critical' | 'high' | 'medium' | 'low';
    probability: 'high' | 'medium' | 'low';
    mitigation: string;
    testCoverage?: string;
}
/**
 * Generate QA Agent: test planning + verification
 */
export declare function generateTestPlan(prd: any, discoveryItems: any[]): Promise<{
    testPlan: TestCase[];
    summary: string;
}>;
/**
 * Generate risk matrix from discovery items
 */
export declare function generateRiskMatrix(discoveryItems: any[]): Promise<{
    riskMatrix: RiskItem[];
    summary: string;
}>;
/**
 * Run static analysis (lint, typecheck)
 */
export declare function runStaticAnalysis(projectPath: string): Promise<{
    success: boolean;
    violations: any[];
    summary: string;
}>;
/**
 * Generate test implementation from test cases
 */
export declare function generateTests(testCases: TestCase[], options: {
    framework?: 'jest' | 'mocha' | 'pytest';
    outputDir?: string;
}): Promise<{
    files: {
        path: string;
        content: string;
    }[];
}>;
/**
 * Peer Review for QA artifacts
 */
export declare function peerReview(qaArtifact: any): Promise<{
    notes: string;
    score: number;
    recommendations: string[];
}>;
//# sourceMappingURL=qa.d.ts.map