import { Gate, ReviewResult } from '../types/review';
import { RunStore } from '../runtime/run-store';
import { PolicyViolationError } from '../runtime/errors';

export class PolicyEngine {
  private runStore: RunStore;
  private gates: Map<string, Gate> = new Map();
  private reviews: Map<string, ReviewResult[]> = new Map(); // gateId -> reviews

  constructor(runStore: RunStore) {
    this.runStore = runStore;
  }

  registerGate(gate: Gate) {
    this.gates.set(gate.id, gate);
  }

  submitReview(gateId: string, review: ReviewResult) {
    if (!this.gates.has(gateId)) {
      throw new Error(`Gate ${gateId} not found`);
    }
    const currentReviews = this.reviews.get(gateId) || [];
    currentReviews.push(review);
    this.reviews.set(gateId, currentReviews);
  }

  checkGate(gateId: string): boolean {
    const gate = this.gates.get(gateId);
    if (!gate) throw new Error(`Gate ${gateId} not found`);

    const reviews = this.reviews.get(gateId) || [];
    const passingReviews = reviews.filter(r => r.passed);

    const passed = passingReviews.length >= gate.requiredApprovals;

    // Log gate result to run manifest
    const manifest = this.runStore.getContext().manifest;
    manifest.gates.push({
      gateId,
      status: passed ? 'passed' : 'failed',
      timestamp: new Date().toISOString(),
      reason: passed 
        ? `Passed with ${passingReviews.length} approvals` 
        : `Failed: requires ${gate.requiredApprovals} approvals, got ${passingReviews.length}`,
      artifactsChecked: [] // TODO: link artifacts
    });

    if (!passed && gate.blocking) {
      throw new PolicyViolationError(`Gate ${gate.name} failed. Required ${gate.requiredApprovals} approvals.`);
    }

    return passed;
  }
}
