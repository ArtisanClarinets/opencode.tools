export class WebSearch {
  fetch(url: string): Promise<any> {
    return Promise.resolve({ content: `mock content for ${url}` });
  }
  search(query: string, num: number): Promise<any> {
    return Promise.resolve({ results: `mock search results for ${query}` });
  }
  searchWithRetry(query: string, num: number, retries: number): Promise<any> {
    return Promise.resolve({ results: `mock search results for ${query} with ${retries} retries` });
  }
  searchForFacts(query: string, num: number): Promise<any> {
    return Promise.resolve({ facts: `mock facts for ${query}` });
  }
}