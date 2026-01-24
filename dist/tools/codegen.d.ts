/**
 * E3: Codegen Agent that is constrained
 */
export declare function scaffold(stack: 'Next.js' | 'NestJS' | 'FastAPI', structure: any): Promise<{
    success: boolean;
    files: string[];
}>;
export declare function generateFeature(story: any, existingFiles: string[]): Promise<{
    code: string;
    tests: string[];
}>;
export declare function generateTests(featureName: string): Promise<{
    tests: string[];
}>;
//# sourceMappingURL=codegen.d.ts.map