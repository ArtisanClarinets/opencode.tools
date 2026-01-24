"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RubricEvaluator = void 0;
class RubricEvaluator {
    evaluate(rubric, scores, reviewerId, comments) {
        let weightedSum = 0;
        let totalWeight = 0;
        let passed = true;
        for (const criterion of rubric.criteria) {
            const scoreEntry = scores.find(s => s.criteriaId === criterion.id);
            const score = scoreEntry ? scoreEntry.score : 0;
            if (score < criterion.passThreshold) {
                passed = false;
            }
            weightedSum += score * criterion.weight;
            totalWeight += criterion.weight;
        }
        const normalizedScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
        if (normalizedScore < rubric.minScoreToPass) {
            passed = false;
        }
        return {
            reviewerId,
            rubricId: rubric.id,
            scores,
            totalScore: normalizedScore,
            passed,
            comments,
            timestamp: new Date().toISOString()
        };
    }
}
exports.RubricEvaluator = RubricEvaluator;
//# sourceMappingURL=rubric.js.map