import { ToolCallRecord } from '../types/run';
import { ToolCache } from './cache';

export class ReplayManager {
  private mode: 'live' | 'replay';
  private cache: ToolCache;

  constructor(mode: 'live' | 'replay', cache: ToolCache) {
    this.mode = mode;
    this.cache = cache;
  }

  isReplay(): boolean {
    return this.mode === 'replay';
  }

  async getReplay(toolId: string, args: any, version: string): Promise<any | null> {
    if (!this.isReplay()) return null;
    const key = this.cache.getCacheKey(toolId, args, version);
    return await this.cache.get(key);
  }
}
