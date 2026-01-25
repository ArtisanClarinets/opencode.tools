"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMCouncil = void 0;
class LLMCouncil {
    constructor() {
        this.members = [];
    }
    addMember(member) {
        this.members.push(member);
    }
    async review(content) {
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
exports.LLMCouncil = LLMCouncil;
//# sourceMappingURL=council.js.map