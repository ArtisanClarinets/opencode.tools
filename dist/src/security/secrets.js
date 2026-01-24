"use strict";
/**
 * Secret Registry & Management
 * Handles registration and detection of secrets for redaction.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretRegistry = void 0;
class SecretRegistry {
    constructor() {
        this.secrets = new Set();
        this.patterns = [
            /sk-[a-zA-Z0-9]{20,}/, // OpenAI style
            /ghp_[a-zA-Z0-9]{20,}/, // GitHub PAT
            /xox[baprs]-[a-zA-Z0-9]{10,}/, // Slack
            /ey[a-zA-Z0-9]{20,}\.[a-zA-Z0-9]{20,}\.[a-zA-Z0-9]{20,}/ // JWT-like
        ];
    }
    static getInstance() {
        if (!SecretRegistry.instance) {
            SecretRegistry.instance = new SecretRegistry();
        }
        return SecretRegistry.instance;
    }
    registerSecret(secret) {
        if (secret && secret.length > 6) { // Min length to avoid noise
            this.secrets.add(secret);
        }
    }
    registerPattern(pattern) {
        this.patterns.push(pattern);
    }
    isSecret(text) {
        if (this.secrets.has(text))
            return true;
        return this.patterns.some(p => p.test(text));
    }
    getSecrets() {
        return Array.from(this.secrets);
    }
    getPatterns() {
        return this.patterns;
    }
}
exports.SecretRegistry = SecretRegistry;
//# sourceMappingURL=secrets.js.map