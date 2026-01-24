"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplayManager = void 0;
class ReplayManager {
    constructor(mode, cache) {
        this.mode = mode;
        this.cache = cache;
    }
    isReplay() {
        return this.mode === 'replay';
    }
    async getReplay(toolId, args, version) {
        if (!this.isReplay())
            return null;
        const key = this.cache.getCacheKey(toolId, args, version);
        return await this.cache.get(key);
    }
}
exports.ReplayManager = ReplayManager;
//# sourceMappingURL=replay.js.map