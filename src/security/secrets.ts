/**
 * Secret Registry & Management
 * Handles registration and detection of secrets for redaction.
 */

export class SecretRegistry {
  private static instance: SecretRegistry;
  private secrets: Set<string> = new Set();
  private patterns: RegExp[] = [
    /sk-[a-zA-Z0-9]{20,}/, // OpenAI style
    /ghp_[a-zA-Z0-9]{20,}/, // GitHub PAT
    /xox[baprs]-[a-zA-Z0-9]{10,}/, // Slack
    /ey[a-zA-Z0-9]{20,}\.[a-zA-Z0-9]{20,}\.[a-zA-Z0-9]{20,}/ // JWT-like
  ];

  private constructor() {}

  static getInstance(): SecretRegistry {
    if (!SecretRegistry.instance) {
      SecretRegistry.instance = new SecretRegistry();
    }
    return SecretRegistry.instance;
  }

  registerSecret(secret: string) {
    if (secret && secret.length > 6) { // Min length to avoid noise
      this.secrets.add(secret);
    }
  }

  registerPattern(pattern: RegExp) {
    this.patterns.push(pattern);
  }

  isSecret(text: string): boolean {
    if (this.secrets.has(text)) return true;
    return this.patterns.some(p => p.test(text));
  }

  getSecrets(): string[] {
    return Array.from(this.secrets);
  }

  getPatterns(): RegExp[] {
    return this.patterns;
  }
}
