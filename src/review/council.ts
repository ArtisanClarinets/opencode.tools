import { ReviewResult } from '../types/review';

export interface CouncilMember {
  name: string;
  role: string;
  review(content: any): Promise<ReviewResult>;
}

export class LLMCouncil {
  private members: CouncilMember[] = [];

  addMember(member: CouncilMember) {
    this.members.push(member);
  }

  async review(content: any): Promise<{ approved: boolean; results: ReviewResult[] }> {
    if (this.members.length === 0) {
      return { approved: true, results: [] };
    }

    const results = await Promise.all(this.members.map(m => m.review(content)));

    const approved = results.every(r => r.passed);

    return {
      approved,
      results
    };
  }
}
