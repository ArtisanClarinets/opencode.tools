import { AgentRunner } from '../../../../src/cowork/runtime/agent-runner';
import { LLMMessage, LLMProvider, LLMResponse } from '../../../../src/cowork/runtime/llm-provider';

class StubToolRouter {
  private readonly definitions: Array<{ name: string; description: string; parameters: unknown }>;
  private readonly executeFn: (agentId: string, toolName: string, args: unknown) => Promise<unknown>;

  constructor(
    executeFn: (agentId: string, toolName: string, args: unknown) => Promise<unknown> = async () => ({ ok: true })
  ) {
    this.definitions = [{ name: 'fs.list', description: 'List files', parameters: { type: 'object' } }];
    this.executeFn = executeFn;
  }

  public getDefinitions(): Array<{ name: string; description: string; parameters: unknown }> {
    return this.definitions;
  }

  public async execute(agentId: string, toolName: string, args: unknown): Promise<unknown> {
    return this.executeFn(agentId, toolName, args);
  }

  public setAllowlist(): void {
    // no-op for tests
  }
}

class SequenceLLMProvider implements LLMProvider {
  private readonly responses: LLMResponse[];
  private cursor = 0;

  constructor(responses: LLMResponse[]) {
    this.responses = responses;
  }

  public async chatCompletion(_messages: LLMMessage[]): Promise<LLMResponse> {
    const response = this.responses[Math.min(this.cursor, this.responses.length - 1)];
    this.cursor += 1;
    return response;
  }
}

describe('cowork/runtime/agent-runner', () => {
  it('returns final response when model does not request tools', async () => {
    const llm = new SequenceLLMProvider([{ content: 'final answer' }]);
    const runner = new AgentRunner(new StubToolRouter() as any, llm);

    const result = await runner.run('agent-1', 'do work');

    expect(result.success).toBe(true);
    expect(result.output).toBe('final answer');
    expect(result.transcript).toContainEqual({ type: 'thought', content: 'final answer' });
  });

  it('supports per-run max step budget and emits run_exit transcript entry', async () => {
    const llm = new SequenceLLMProvider([
      { content: null, function_call: { name: 'fs.list', arguments: '{}' } },
      { content: null, function_call: { name: 'fs.list', arguments: '{}' } },
      { content: null, function_call: { name: 'fs.list', arguments: '{}' } }
    ]);
    const runner = new AgentRunner(new StubToolRouter() as any, llm);

    const result = await runner.run('agent-1', 'loop forever', undefined, { maxSteps: 2 });

    expect(result.success).toBe(false);
    expect(result.output).toBe('Max steps reached');
    expect(result.transcript).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'run_exit', reason: 'max_steps', maxSteps: 2 })
      ])
    );
  });

  it('supports timeout budget and records timeout exit', async () => {
    const llm: LLMProvider = {
      chatCompletion: () => new Promise<LLMResponse>((resolve) => {
        setTimeout(() => resolve({ content: 'late response' }), 50);
      })
    };
    const runner = new AgentRunner(new StubToolRouter() as any, llm);

    const result = await runner.run('agent-1', 'slow task', undefined, { timeoutMs: 10 });

    expect(result.success).toBe(false);
    expect(result.output).toContain('timeout budget');
    expect(result.transcript).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'run_exit', reason: 'timeout', timeoutMs: 10 })
      ])
    );
  });

  it('supports AbortSignal cancellation and records cancellation exit', async () => {
    const llm: LLMProvider = {
      chatCompletion: () => new Promise<LLMResponse>((resolve) => {
        setTimeout(() => resolve({ content: 'late response' }), 100);
      })
    };
    const runner = new AgentRunner(new StubToolRouter() as any, llm);
    const controller = new AbortController();

    const runPromise = runner.run('agent-1', 'cancel me', undefined, { signal: controller.signal });
    setTimeout(() => controller.abort(), 5);

    const result = await runPromise;

    expect(result.success).toBe(false);
    expect(result.output).toContain('cancel');
    expect(result.transcript).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'run_exit', reason: 'cancelled' })
      ])
    );
  });
});
