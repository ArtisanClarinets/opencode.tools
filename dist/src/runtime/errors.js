"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityError = exports.ReviewFailedError = exports.EvidenceError = exports.MissingArtifactError = exports.PolicyViolationError = exports.BaseError = void 0;
class BaseError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
exports.BaseError = BaseError;
class PolicyViolationError extends BaseError {
    constructor(message, policyId) {
        super(`Policy Violation: ${message}`);
        this.policyId = policyId;
    }
}
exports.PolicyViolationError = PolicyViolationError;
class MissingArtifactError extends BaseError {
    constructor(artifactId) {
        super(`Missing required artifact: ${artifactId}`);
    }
}
exports.MissingArtifactError = MissingArtifactError;
class EvidenceError extends BaseError {
    constructor(message) {
        super(`Evidence Error: ${message}`);
    }
}
exports.EvidenceError = EvidenceError;
class ReviewFailedError extends BaseError {
    constructor(reason) {
        super(`Review Failed: ${reason}`);
    }
}
exports.ReviewFailedError = ReviewFailedError;
class SecurityError extends BaseError {
    constructor(message) {
        super(`Security Violation: ${message}`);
    }
}
exports.SecurityError = SecurityError;
//# sourceMappingURL=errors.js.map