"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactor = exports.Redactor = void 0;
const secrets_1 = require("./secrets");
/**
 * Redaction utility
 * Sanitizes outputs, logs, and artifacts.
 */
class Redactor {
    constructor() {
        this.replacement = '[REDACTED]';
        this.registry = secrets_1.SecretRegistry.getInstance();
    }
    redact(text) {
        if (!text)
            return text;
        let redacted = text;
        // Redact registered secrets
        for (const secret of this.registry.getSecrets()) {
            redacted = redacted.split(secret).join(this.replacement);
        }
        // Redact patterns
        for (const pattern of this.registry.getPatterns()) {
            redacted = redacted.replace(pattern, this.replacement);
        }
        return redacted;
    }
    redactObject(obj) {
        if (typeof obj === 'string') {
            return this.redact(obj);
        }
        if (Array.isArray(obj)) {
            return obj.map(item => this.redactObject(item));
        }
        if (typeof obj === 'object' && obj !== null) {
            const newObj = {};
            for (const key in obj) {
                // Redact keys if they contain secrets (unlikely but possible)
                // Redact values
                newObj[key] = this.redactObject(obj[key]);
            }
            return newObj;
        }
        return obj;
    }
}
exports.Redactor = Redactor;
exports.redactor = new Redactor();
//# sourceMappingURL=redaction.js.map