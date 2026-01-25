import { ReviewResult } from '../types/review';
export interface CouncilMember {
    name: string;
    role: string;
    review(content: any): Promise<ReviewResult>;
}
export declare class LLMCouncil {
    private members;
    addMember(member: CouncilMember): void;
    review(content: any): Promise<{
        approved: boolean;
        results: ReviewResult[];
    }>;
}
//# sourceMappingURL=council.d.ts.map