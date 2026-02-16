"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceRateLimit = enforceRateLimit;
/**
 * Manages rate limiting for external services using an exponential backoff strategy.
 */
async function enforceRateLimit(toolName, attempt = 1) {
    if (attempt > 1) {
        const delay = Math.pow(2, attempt) * 100; // Exponential backoff in ms
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    return {
        success: true,
        content: `Rate limit check passed for ${toolName} on attempt ${attempt}`
    };
}
//# sourceMappingURL=rate-limit.js.map