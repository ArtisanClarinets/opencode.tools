"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactText = redactText;
function redactText(text) {
    return text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED]');
}
//# sourceMappingURL=redaction.js.map