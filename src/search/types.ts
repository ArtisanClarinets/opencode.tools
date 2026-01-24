export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  publishedAt?: string;
  source: string;
}

export interface SearchProvider {
  name: string;
  search(query: string, limit?: number): Promise<SearchResult[]>;
}
