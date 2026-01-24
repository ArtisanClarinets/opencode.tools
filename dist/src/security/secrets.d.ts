/**
 * Secret Registry & Management
 * Handles registration and detection of secrets for redaction.
 */
export declare class SecretRegistry {
    private static instance;
    private secrets;
    private patterns;
    private constructor();
    static getInstance(): SecretRegistry;
    registerSecret(secret: string): void;
    registerPattern(pattern: RegExp): void;
    isSecret(text: string): boolean;
    getSecrets(): string[];
    getPatterns(): RegExp[];
}
//# sourceMappingURL=secrets.d.ts.map