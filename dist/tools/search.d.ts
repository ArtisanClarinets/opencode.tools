export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    position: number;
}
export interface SearchResponse {
    success: boolean;
    query: string;
    results: SearchResult[];
    totalResults?: number;
    error?: string;
}
/**
 * Executes a search query using DuckDuckGo HTML
 */
export declare function search(query: string, options?: {
    numResults?: number;
    safeSearch?: boolean;
}): Promise<SearchResponse>;
/**
 * Search with retry logic for resilience
 */
export declare function searchWithRetry(query: string, options?: {
    numResults?: number;
    maxRetries?: number;
    retryDelay?: number;
}): Promise<SearchResponse>;
/**
 * Extract structured data from search results
 */
export declare function searchForFacts(query: string, factsToFind: string[]): Promise<{
    success: boolean;
    facts: Record<string, string | null>;
}>;
export default search;
//# sourceMappingURL=search.d.ts.map