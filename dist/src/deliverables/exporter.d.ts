import { ArtifactManager } from '../runtime/artifacts';
export declare class Exporter {
    private artifactManager;
    constructor(artifactManager: ArtifactManager);
    createBundle(runId: string, outputDir: string): Promise<string>;
    zipDirectory(sourceDir: string, outPath: string): Promise<void>;
}
//# sourceMappingURL=exporter.d.ts.map