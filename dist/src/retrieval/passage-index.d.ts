import { Passage } from './chunker';
export declare class PassageIndex {
    private passages;
    private invertedIndex;
    add(passages: Passage[]): void;
    private indexPassage;
    search(query: string, limit?: number): Passage[];
    get(id: string): Passage | undefined;
}
//# sourceMappingURL=passage-index.d.ts.map