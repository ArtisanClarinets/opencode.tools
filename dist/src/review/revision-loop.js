"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevisionLoop = void 0;
class RevisionLoop {
    constructor(reviewers, policyEngine) {
        this.reviewers = reviewers;
        this.policyEngine = policyEngine;
    }
    async runReview(gateId, content, rubric) {
        console.log(`Starting review loop for gate ${gateId}...`);
        const results = [];
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
            }
            else {
                console.log(`Gate ${gateId} failed.`);
                return false;
            }
        }
        catch (e) {
            console.log(`Gate ${gateId} failed with error: ${e}`);
            return false;
        }
    }
}
exports.RevisionLoop = RevisionLoop;
//# sourceMappingURL=revision-loop.js.map