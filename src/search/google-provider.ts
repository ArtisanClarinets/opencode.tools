import axios from 'axios';
import { SearchProvider, SearchResult } from './types';

interface GoogleSearchItem {
  link: string;
  title: string;
  snippet: string;
}

export class GoogleSearchProvider implements SearchProvider {
  name = 'GoogleCustomSearch';
  private apiKey: string;
  private cx: string;

  constructor(apiKey: string, cx: string) {
    this.apiKey = apiKey;
    this.cx = cx;
  }

  async search(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!this.apiKey || !this.cx) {
        // Fallback to mock if no keys (for local dev without keys)
        console.warn('Google Search keys missing, returning mock results.');
        return [
            {
                url: 'https://example.com',
                title: 'Example Domain',
                snippet: 'This domain is for use in illustrative examples in documents.',
                source: 'mock'
            }
        ];
    }

    try {
      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.apiKey,
          cx: this.cx,
          q: query,
          num: limit
        }
      });

      return (response.data.items || []).map((item: GoogleSearchItem) => ({
        url: item.link,
        title: item.title,
        snippet: item.snippet,
        source: 'google'
      }));
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }
}
