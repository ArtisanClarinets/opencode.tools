import { CouncilMember } from './council';
import { ReviewResult } from '../types/review';
import { LLMProvider } from '../runtime/llm';
declare abstract class BaseValidator implements CouncilMember {
    abstract name: string;
    abstract role: string;
    protected llm: LLMProvider;
    constructor(llm?: LLMProvider);
    abstract review(content: any): Promise<ReviewResult>;
    protected parseLLMResponse(responseContent: string): {
        valid: boolean;
        score: number;
        comment: string;
        issues?: string[];
    };
    protected createResult(passed: boolean, scoreVal: number, comment: string, criteriaId: string): ReviewResult;
}
export declare class CitationVerifier extends BaseValidator {
    name: string;
    role: string;
    review(content: any): Promise<ReviewResult>;
}
export declare class SummaryReviewer extends BaseValidator {
    name: string;
    role: string;
    review(content: any): Promise<ReviewResult>;
}
export declare class DataValidator extends BaseValidator {
    name: string;
    role: string;
    review(content: any): Promise<ReviewResult>;
}
export {};
//# sourceMappingURL=validators.d.ts.map