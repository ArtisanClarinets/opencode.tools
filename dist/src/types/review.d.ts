export interface RubricCriteria {
    id: string;
    description: string;
    weight: number;
    passThreshold: number;
}
export interface Rubric {
    id: string;
    name: string;
    criteria: RubricCriteria[];
    minScoreToPass: number;
}
export interface ReviewScore {
    criteriaId: string;
    score: number;
    comment?: string;
}
export interface ReviewResult {
    reviewerId: string;
    rubricId: string;
    scores: ReviewScore[];
    totalScore: number;
    passed: boolean;
    comments: string;
    timestamp: string;
}
export interface Gate {
    id: string;
    name: string;
    rubricId: string;
    requiredApprovals: number;
    blocking: boolean;
}
//# sourceMappingURL=review.d.ts.map