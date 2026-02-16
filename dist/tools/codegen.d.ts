export type Stack = 'Next.js' | 'NestJS' | 'FastAPI' | 'Express' | 'React' | 'Python-Flask' | 'Python-Django';
export interface ScaffoldOptions {
    projectName: string;
    outputDir?: string;
    options?: {
        withAuth?: boolean;
        withDatabase?: boolean;
        withTests?: boolean;
        withDocker?: boolean;
    };
}
export interface FileTemplate {
    path: string;
    content: string;
}
/**
 * Scaffold a new project
 */
export declare function scaffold(stack: Stack, structure: ScaffoldOptions): Promise<{
    success: boolean;
    files: string[];
    summary: string;
}>;
/**
 * Generate feature code
 */
export declare function generateFeature(story: any, existingFiles: string[]): Promise<{
    files: {
        path: string;
        content: string;
    }[];
    summary: string;
}>;
/**
 * Generate tests for a feature
 */
export declare function generateTests(featureName: string, options?: {
    framework?: 'jest' | 'mocha';
    outputDir?: string;
}): Promise<{
    files: {
        path: string;
        content: string;
    }[];
}>;
//# sourceMappingURL=codegen.d.ts.map