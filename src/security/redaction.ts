import { SecretRegistry } from './secrets';

/**
 * Redaction utility
 * Sanitizes outputs, logs, and artifacts.
 */
export class Redactor {
  private registry: SecretRegistry;
  private replacement = '[REDACTED]';

  constructor() {
    this.registry = SecretRegistry.getInstance();
  }

  redact(text: string): string {
    if (!text) return text;
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

  redactObject(obj: unknown): unknown {
    if (typeof obj === 'string') {
      return this.redact(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.redactObject(item));
    }
    if (typeof obj === 'object' && obj !== null) {
      const newObj: Record<string, unknown> = {};
      const record = obj as Record<string, unknown>;
      for (const key in record) {
        // Redact keys if they contain secrets (unlikely but possible)
        // Redact values
        newObj[key] = this.redactObject(record[key]);
      }
      return newObj;
    }
    return obj;
  }
}

export const redactor = new Redactor();
