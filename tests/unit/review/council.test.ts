import { LLMCouncil } from '../../../src/review/council';
import { CouncilMember } from '../../../src/review/council';

class MockMember implements CouncilMember {
  name: string;
  role: string;
  shouldPass: boolean;

  constructor(name: string, shouldPass: boolean) {
    this.name = name;
    this.role = 'Mock Role';
    this.shouldPass = shouldPass;
  }

  async review(content: any) {
    return {
      reviewerId: this.name,
      rubricId: 'test',
      scores: [],
      totalScore: this.shouldPass ? 1.0 : 0.0,
      passed: this.shouldPass,
      comments: 'Test comment',
      timestamp: new Date().toISOString()
    };
  }
}

describe('LLMCouncil', () => {
  it('should pass if all members pass', async () => {
    const council = new LLMCouncil();
    council.addMember(new MockMember('Member1', true));
    council.addMember(new MockMember('Member2', true));

    const result = await council.review({});
    expect(result.approved).toBe(true);
    expect(result.results.length).toBe(2);
  });

  it('should fail if any member fails', async () => {
    const council = new LLMCouncil();
    council.addMember(new MockMember('Member1', true));
    council.addMember(new MockMember('Member2', false));

    const result = await council.review({});
    expect(result.approved).toBe(false);
    expect(result.results.length).toBe(2);
  });
});
