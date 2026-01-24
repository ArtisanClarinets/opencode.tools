export interface WebPage {
    url: string;
    title: string;
    content: string;
    html: string;
    metadata: Record<string, any>;
}
export declare class WebFetcher {
    fetch(url: string): Promise<WebPage>;
    private sanitize;
}
//# sourceMappingURL=fetcher.d.ts.map