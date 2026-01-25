export interface WebFetchResult {
    success: boolean;
    content: string;
    url: string;
    error?: string;
    status?: number;
}
export declare function webfetch(url: string, format?: 'markdown' | 'text' | 'html'): Promise<WebFetchResult>;
//# sourceMappingURL=webfetch.d.ts.map