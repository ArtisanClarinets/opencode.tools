export class BaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class PolicyViolationError extends BaseError {
  constructor(message: string, public policyId?: string) {
    super(`Policy Violation: ${message}`);
  }
}

export class MissingArtifactError extends BaseError {
  constructor(artifactId: string) {
    super(`Missing required artifact: ${artifactId}`);
  }
}

export class EvidenceError extends BaseError {
  constructor(message: string) {
    super(`Evidence Error: ${message}`);
  }
}

export class ReviewFailedError extends BaseError {
  constructor(reason: string) {
    super(`Review Failed: ${reason}`);
  }
}

export class SecurityError extends BaseError {
  constructor(message: string) {
    super(`Security Violation: ${message}`);
  }
}
