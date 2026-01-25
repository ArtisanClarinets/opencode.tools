import { LLMProvider, LLMResponse } from './llm';
export declare class OpenAILLMProvider implements LLMProvider {
    private apiKey;
    private model;
    constructor(apiKey: string, model?: string);
    generate(prompt: string, context?: any): Promise<LLMResponse>;
    analyze(content: string, criteria: string): Promise<LLMResponse>;
}
//# sourceMappingURL=openai-provider.d.ts.map