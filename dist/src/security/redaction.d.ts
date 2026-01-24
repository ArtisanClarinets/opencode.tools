/**
 * Redaction utility
 * Sanitizes outputs, logs, and artifacts.
 */
export declare class Redactor {
    private registry;
    private replacement;
    constructor();
    redact(text: string): string;
    redactObject(obj: any): any;
}
export declare const redactor: Redactor;
//# sourceMappingURL=redaction.d.ts.map