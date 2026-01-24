import { ToolCache } from './cache';
export declare class ReplayManager {
    private mode;
    private cache;
    constructor(mode: 'live' | 'replay', cache: ToolCache);
    isReplay(): boolean;
    getReplay(toolId: string, args: any, version: string): Promise<any | null>;
}
//# sourceMappingURL=replay.d.ts.map