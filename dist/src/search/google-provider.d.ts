import { SearchProvider, SearchResult } from './types';
export declare class GoogleSearchProvider implements SearchProvider {
    name: string;
    private apiKey;
    private cx;
    constructor(apiKey: string, cx: string);
    search(query: string, limit?: number): Promise<SearchResult[]>;
}
//# sourceMappingURL=google-provider.d.ts.map