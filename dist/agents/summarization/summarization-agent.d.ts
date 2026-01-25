import { ResearchDossier, Source } from '../research/types';
import { LLMProvider } from '../../src/runtime/llm';
export interface SummarizationOutput {
    summary: string;
    keyInsights: string[];
    reportDate: string;
}
export declare class SummarizationAgent {
    private llm;
    constructor(llm?: LLMProvider);
    summarize(dossier: ResearchDossier, sources: Source[]): Promise<SummarizationOutput>;
}
//# sourceMappingURL=summarization-agent.d.ts.map