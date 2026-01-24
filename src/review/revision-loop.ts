import { Reviewer } from './reviewer';
import { Rubric, ReviewResult } from '../types/review';
import { PolicyEngine } from '../governance/policy-engine';

export class RevisionLoop {
  private reviewers: Reviewer[];
  private policyEngine: PolicyEngine;

  constructor(reviewers: Reviewer[], policyEngine: PolicyEngine) {
    this.reviewers = reviewers;
    this.policyEngine = policyEngine;
  }

  async runReview(gateId: string, content: any, rubric: Rubric): Promise<boolean> {
    console.log(`Starting review loop for gate ${gateId}...`);
    
    const results: ReviewResult[] = [];

    for (const reviewer of this.reviewers) {
      console.log(`Reviewer ${reviewer.name} is reviewing...`);
      const result = await reviewer.review(content, rubric);
      results.push(result);
      this.policyEngine.submitReview(gateId, result);
    }

    // Check if gate passes
    try {
      const passed = this.policyEngine.checkGate(gateId);
      if (passed) {
        console.log(`Gate ${gateId} passed.`);
        return true;
      } else {
        console.log(`Gate ${gateId} failed.`);
        return false;
      }
    } catch (e) {
      console.log(`Gate ${gateId} failed with error: ${e}`);
      return false;
    }
  }
}
