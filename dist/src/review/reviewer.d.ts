import { Rubric, ReviewResult } from '../types/review';
export interface Reviewer {
    id: string;
    name: string;
    role: 'methodology' | 'citations' | 'adversarial' | 'editor';
    review(content: any, rubric: Rubric): Promise<ReviewResult>;
}
export declare class AutoReviewer implements Reviewer {
    id: string;
    name: string;
    role: 'methodology' | 'citations' | 'adversarial' | 'editor';
    private evaluator;
    constructor(id: string, role: 'methodology' | 'citations' | 'adversarial' | 'editor');
    review(content: any, rubric: Rubric): Promise<ReviewResult>;
}
//# sourceMappingURL=reviewer.d.ts.map