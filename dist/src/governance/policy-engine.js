"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyEngine = void 0;
const errors_1 = require("../runtime/errors");
class PolicyEngine {
    constructor(runStore) {
        this.gates = new Map();
        this.reviews = new Map(); // gateId -> reviews
        this.runStore = runStore;
    }
    registerGate(gate) {
        this.gates.set(gate.id, gate);
    }
    submitReview(gateId, review) {
        if (!this.gates.has(gateId)) {
            throw new Error(`Gate ${gateId} not found`);
        }
        const currentReviews = this.reviews.get(gateId) || [];
        currentReviews.push(review);
        this.reviews.set(gateId, currentReviews);
    }
    checkGate(gateId) {
        const gate = this.gates.get(gateId);
        if (!gate)
            throw new Error(`Gate ${gateId} not found`);
        const reviews = this.reviews.get(gateId) || [];
        const passingReviews = reviews.filter(r => r.passed);
        const passed = passingReviews.length >= gate.requiredApprovals;
        // Log gate result to run manifest
        const context = this.runStore.getContext();
        const manifest = context.manifest;
        // Link artifacts from the current run context
        const artifactsChecked = manifest.artifacts.map((a) => a.id);
        manifest.gates.push({
            gateId,
            status: passed ? 'passed' : 'failed',
            timestamp: new Date().toISOString(),
            reason: passed
                ? `Passed with ${passingReviews.length} approvals`
                : `Failed: requires ${gate.requiredApprovals} approvals, got ${passingReviews.length}`,
            artifactsChecked
        });
        if (!passed && gate.blocking) {
            throw new errors_1.PolicyViolationError(`Gate ${gate.name} failed. Required ${gate.requiredApprovals} approvals.`);
        }
        return passed;
    }
}
exports.PolicyEngine = PolicyEngine;
//# sourceMappingURL=policy-engine.js.map