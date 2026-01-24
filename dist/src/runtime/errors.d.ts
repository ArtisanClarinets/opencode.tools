export declare class BaseError extends Error {
    constructor(message: string);
}
export declare class PolicyViolationError extends BaseError {
    policyId?: string | undefined;
    constructor(message: string, policyId?: string | undefined);
}
export declare class MissingArtifactError extends BaseError {
    constructor(artifactId: string);
}
export declare class EvidenceError extends BaseError {
    constructor(message: string);
}
export declare class ReviewFailedError extends BaseError {
    constructor(reason: string);
}
export declare class SecurityError extends BaseError {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map