"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoReviewer = void 0;
const rubric_1 = require("../governance/rubric");
class AutoReviewer {
    constructor(id, role) {
        this.id = id;
        this.name = `Auto-${role}`;
        this.role = role;
        this.evaluator = new rubric_1.RubricEvaluator();
    }
    async review(content, rubric) {
        // In a real system, this would call an LLM to evaluate the content against the rubric.
        // Here we simulate a passing review with some randomness or logic based on content.
        const scores = rubric.criteria.map(c => ({
            criteriaId: c.id,
            score: 0.9, // Mock high score
            comment: 'Looks good automatically.'
        }));
        return this.evaluator.evaluate(rubric, scores, this.id, 'Automated review passed.');
    }
}
exports.AutoReviewer = AutoReviewer;
//# sourceMappingURL=reviewer.js.map