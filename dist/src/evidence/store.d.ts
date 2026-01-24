import { ArtifactManager } from '../runtime/artifacts';
import { WebPage } from '../search/fetcher';
export declare class EvidenceStore {
    private artifactManager;
    constructor(artifactManager: ArtifactManager);
    add(page: WebPage): Promise<string>;
}
//# sourceMappingURL=store.d.ts.map