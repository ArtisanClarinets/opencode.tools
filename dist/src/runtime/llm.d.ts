export interface LLMResponse {
    content: string;
    metadata?: any;
}
export interface LLMProvider {
    generate(prompt: string, context?: any): Promise<LLMResponse>;
    analyze(content: string, criteria: string): Promise<LLMResponse>;
}
export declare class MockLLMProvider implements LLMProvider {
    generate(prompt: string, context?: any): Promise<LLMResponse>;
    analyze(content: string, criteria: string): Promise<LLMResponse>;
}
//# sourceMappingURL=llm.d.ts.map