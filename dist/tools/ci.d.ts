/**
 * E4: Repo operations / ci
 * Verifies the codebase against strict quality gates.
 */
export declare function verify(projectPath: string, checks: ('lint' | 'test' | 'typecheck')[]): Promise<{
    success: boolean;
    results: {
        check: string;
        status: 'pass' | 'fail';
        output?: string;
    }[];
}>;
//# sourceMappingURL=ci.d.ts.map