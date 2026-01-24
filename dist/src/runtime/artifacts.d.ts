import { ArtifactRecord } from '../types/run';
export declare class ArtifactManager {
    private runDir;
    private artifactsDir;
    constructor(runDir: string);
    store(relativePath: string, content: string | Buffer, type: string, metadata?: Record<string, any>): Promise<ArtifactRecord>;
    get(relativePath: string): Promise<Buffer>;
    exists(relativePath: string): boolean;
}
//# sourceMappingURL=artifacts.d.ts.map