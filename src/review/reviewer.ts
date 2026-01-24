import { Rubric, ReviewResult, ReviewScore } from '../types/review';
import { RubricEvaluator } from '../governance/rubric';

export interface Reviewer {
  id: string;
  name: string;
  role: 'methodology' | 'citations' | 'adversarial' | 'editor';
  review(content: any, rubric: Rubric): Promise<ReviewResult>;
}

export class AutoReviewer implements Reviewer {
  id: string;
  name: string;
  role: 'methodology' | 'citations' | 'adversarial' | 'editor';
  private evaluator: RubricEvaluator;

  constructor(id: string, role: 'methodology' | 'citations' | 'adversarial' | 'editor') {
    this.id = id;
    this.name = `Auto-${role}`;
    this.role = role;
    this.evaluator = new RubricEvaluator();
  }

  async review(content: any, rubric: Rubric): Promise<ReviewResult> {
    // In a real system, this would call an LLM to evaluate the content against the rubric.
    // Here we simulate a passing review with some randomness or logic based on content.
    
    const scores: ReviewScore[] = rubric.criteria.map(c => ({
      criteriaId: c.id,
      score: 0.9, // Mock high score
      comment: 'Looks good automatically.'
    }));

    return this.evaluator.evaluate(rubric, scores, this.id, 'Automated review passed.');
  }
}
