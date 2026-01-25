"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchGatekeeper = void 0;
class ResearchGatekeeper {
    constructor(minSources = 3, minDomains = 2) {
        this.minSources = minSources;
        this.minDomains = minDomains;
    }
    evaluate(sources) {
        const reasons = [];
        let score = 0;
        // Check count
        if (sources.length >= this.minSources) {
            score += 0.5;
        }
        else {
            reasons.push(`Insufficient sources: ${sources.length}/${this.minSources}`);
        }
        // Check domain diversity
        const domains = new Set(sources.map(s => {
            try {
                return new URL(s.url).hostname;
            }
            catch {
                return 'unknown';
            }
        }));
        if (domains.size >= this.minDomains) {
            score += 0.5;
        }
        else {
            reasons.push(`Insufficient domain diversity: ${domains.size}/${this.minDomains}`);
        }
        const passed = reasons.length === 0;
        return {
            passed,
            score,
            reasons
        };
    }
}
exports.ResearchGatekeeper = ResearchGatekeeper;
//# sourceMappingURL=gatekeeper.js.map