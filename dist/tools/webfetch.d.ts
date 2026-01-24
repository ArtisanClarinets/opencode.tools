/**
 * Fetches content from a specified URL, handles HTTP requests, and extracts text using a readability algorithm.
 * Replaces the mock with a real HTTP fetch layer.
 * @param url The URL to fetch.
 * @param format The desired output format ("markdown", "text", "html").
 * @returns The fetched content.
 */
export declare function webfetch(url: string, format?: 'markdown' | 'text' | 'html'): Promise<any>;
//# sourceMappingURL=webfetch.d.ts.map