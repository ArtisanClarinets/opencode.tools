import { v4 as uuidv4 } from 'uuid';
import { RunStore } from './run-store';
import { ToolCache } from './cache';
import { ReplayManager } from './replay';
import { ToolCallRecord } from '../types/run';
import { PolicyViolationError } from './errors';
import { redactor } from '../security/redaction';

export class ToolWrapper {
  private runStore: RunStore;
  private cache: ToolCache;
  private replayManager: ReplayManager;

  constructor(runStore: RunStore) {
    this.runStore = runStore;
    this.cache = new ToolCache(runStore.getContext().baseDir);
    this.replayManager = new ReplayManager(runStore.getContext().mode, this.cache);
  }

  async execute<TArgs, TResult>(
    toolId: string,
    version: string,
    args: TArgs,
    implementation: (args: TArgs) => Promise<TResult>
  ): Promise<TResult> {
    const start = Date.now();
    const callId = uuidv4();

    // Check Replay
    if (this.replayManager.isReplay()) {
      const cached = await this.replayManager.getReplay(toolId, args, version);
      if (cached) {
        console.log(`[Replay] Using cached result for ${toolId}`);
        return cached as TResult;
      }
      throw new Error(`[Replay] No cached result found for ${toolId}`);
    }

    // Validate Input (Redaction/Security check on args could go here)
    // For now, we assume args are safe or will be redacted in logs.
    
    let result: TResult | undefined;
    let error: any;
    let success = false;

    try {
      result = await implementation(args);
      success = true;

      // Cache successful result
      const cacheKey = this.cache.getCacheKey(toolId, args, version);
      await this.cache.set(cacheKey, result);

    } catch (err: any) {
      error = err;
      throw err;
    } finally {
      const duration = Date.now() - start;
      
      const record: ToolCallRecord = {
        id: callId,
        toolId,
        args,
        timestamp: new Date().toISOString(),
        durationMs: duration,
        success,
        output: result, // Can be undefined if tool threw before returning
        error: error ? { message: error.message, stack: error.stack } : undefined
      };

      // Audit Log (Redacted inside logger)
      await this.runStore.getAuditLogger().log(record);
    }

    return result;
  }
}
