export interface RubricCriteria {
  id: string;
  description: string;
  weight: number; // 0.0 to 1.0
  passThreshold: number; // 0.0 to 1.0
}

export interface Rubric {
  id: string;
  name: string;
  criteria: RubricCriteria[];
  minScoreToPass: number; // 0.0 to 1.0
}

export interface ReviewScore {
  criteriaId: string;
  score: number; // 0.0 to 1.0
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
