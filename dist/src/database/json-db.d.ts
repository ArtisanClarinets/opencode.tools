import { Database, ResearchRecord } from './types';
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
    private isValidResearchId;
    updateStatus(researchId: string, status: ResearchRecord['status']): Promise<void>;
    if(record: any): void;
}
//# sourceMappingURL=json-db.d.ts.map