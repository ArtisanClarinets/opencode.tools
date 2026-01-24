import { RunStore } from './run-store';
export declare class ToolWrapper {
    private runStore;
    private cache;
    private replayManager;
    constructor(runStore: RunStore);
    execute<TArgs, TResult>(toolId: string, version: string, args: TArgs, implementation: (args: TArgs) => Promise<TResult>): Promise<TResult>;
}
//# sourceMappingURL=tool-wrapper.d.ts.map