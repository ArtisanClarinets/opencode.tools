export interface ResearchFinding {
    id: string;
    sourceUrl: string;
    content: string;
    timestamp: string;
    relevanceScore: number;
    metadata?: any;
}
export interface ResearchRecord {
    id: string;
    topic: string;
    status: 'in_progress' | 'completed' | 'archived';
    startedAt: string;
    completedAt?: string;
    findings: ResearchFinding[];
    summary?: string;
    reviews?: any[];
}
export interface Database {
    saveResearch(record: ResearchRecord): Promise<void>;
    getResearch(id: string): Promise<ResearchRecord | null>;
    getAllResearch(): Promise<ResearchRecord[]>;
    addFinding(researchId: string, finding: ResearchFinding): Promise<void>;
    updateStatus(researchId: string, status: ResearchRecord['status']): Promise<void>;
}
//# sourceMappingURL=types.d.ts.map