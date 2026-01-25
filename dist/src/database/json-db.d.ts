import { Database, ResearchRecord, ResearchFinding } from './types';
export declare class JsonDatabase implements Database {
    private dbPath;
    private data;
    constructor(storageDir?: string);
    private ensureDbExists;
    private load;
    private save;
    saveResearch(record: ResearchRecord): Promise<void>;
    getResearch(id: string): Promise<ResearchRecord | null>;
    getAllResearch(): Promise<ResearchRecord[]>;
    addFinding(researchId: string, finding: ResearchFinding): Promise<void>;
    updateStatus(researchId: string, status: ResearchRecord['status']): Promise<void>;
}
//# sourceMappingURL=json-db.d.ts.map