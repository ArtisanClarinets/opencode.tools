/**
 * Placeholder for Secrets Manager integration.
 *
 * Requirements addressed (TODO.md line 119):
 * - Never commit secrets; integrate a secrets manager for runtime retrieval.
 */

const MOCK_SECRETS: { [key: string]: string } = {
  'GITHUB_API_KEY': 'mock-gh-token-12345',
  'OPENAI_API_KEY': 'sk-mock-openai-key-54321',
  'CLIENT_DB_PASSWORD': 'mock-db-password-change-me',
};

/**
 * Retrieves a secret value by key from the mock store.
 * In a real system, this would interface with AWS Secrets Manager, Vault, etc.
 * @param key The key of the secret to retrieve.
 * @returns The secret value.
 */
export function getSecret(key: string): string {
  const secret = MOCK_SECRETS[key];
  if (!secret) {
    console.warn("Attempted to retrieve unknown secret: " + key);
    return "SECRET_NOT_FOUND_" + key;
  }
  return secret;
}