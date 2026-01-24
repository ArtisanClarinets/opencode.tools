/**
 * Manages rate limiting for external services (e.g., search, webfetch) using an exponential backoff strategy.
 * This tool is primarily an internal utility but is registered to enforce the policy.
 */
export declare function enforceRateLimit(toolName: string, attempt?: number): Promise<any>;
//# sourceMappingURL=rate-limit.d.ts.map