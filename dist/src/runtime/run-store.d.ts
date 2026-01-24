import { RunContext } from '../types/run';
import { AuditLogger } from './audit';
import { ArtifactManager } from './artifacts';
export declare class RunStore {
    private context;
    private auditLogger;
    private artifactManager;
    constructor(runId?: string, baseDir?: string);
    getContext(): RunContext;
    getAuditLogger(): AuditLogger;
    getArtifactManager(): ArtifactManager;
    saveManifest(): Promise<void>;
    complete(): Promise<void>;
    fail(error: Error): Promise<void>;
}
//# sourceMappingURL=run-store.d.ts.map