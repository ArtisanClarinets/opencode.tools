export interface Passage {
    id: string;
    docId: string;
    text: string;
    offset: number;
    length: number;
}
export declare class Chunker {
    private chunkSize;
    private overlap;
    constructor(chunkSize?: number, overlap?: number);
    chunk(text: string, docId: string): Passage[];
}
//# sourceMappingURL=chunker.d.ts.map