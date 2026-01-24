"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassageIndex = void 0;
class PassageIndex {
    constructor() {
        this.passages = new Map();
        this.invertedIndex = new Map(); // word -> passageIds
    }
    add(passages) {
        for (const p of passages) {
            this.passages.set(p.id, p);
            this.indexPassage(p);
        }
    }
    indexPassage(p) {
        const words = p.text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        for (const word of words) {
            if (!this.invertedIndex.has(word)) {
                this.invertedIndex.set(word, new Set());
            }
            this.invertedIndex.get(word).add(p.id);
        }
    }
    search(query, limit = 5) {
        const words = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        const scores = new Map();
        for (const word of words) {
            const ids = this.invertedIndex.get(word);
            if (ids) {
                for (const id of ids) {
                    scores.set(id, (scores.get(id) || 0) + 1);
                }
            }
        }
        // Sort by score
        const sortedIds = Array.from(scores.entries())
            .sort((a, b) => b[1] - a[1])
            .map(e => e[0])
            .slice(0, limit);
        return sortedIds.map(id => this.passages.get(id));
    }
    get(id) {
        return this.passages.get(id);
    }
}
exports.PassageIndex = PassageIndex;
//# sourceMappingURL=passage-index.js.map