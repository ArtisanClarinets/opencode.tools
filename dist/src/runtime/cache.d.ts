export declare class ToolCache {
    private cacheDir;
    constructor(runDir: string);
    getCacheKey(toolId: string, args: any, version: string): string;
    get(key: string): Promise<any | null>;
    set(key: string, value: any): Promise<void>;
}
//# sourceMappingURL=cache.d.ts.map