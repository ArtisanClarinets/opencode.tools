/**
 * ESLint configuration for OpenCode Tools
 * - Adjusted to support TypeScript 5.x and developer workflow
 * - Relaxed a small set of rules in test code to reduce noise while preserving
 *   important type-checked rules for production code.
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaVersion: 2022
  },
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  rules: {
    // Allow intentionally unused variables/args prefixed with `_`
    '@typescript-eslint/no-unused-vars': ['error', { 'varsIgnorePattern': '^_', 'argsIgnorePattern': '^_' }],
    // Tests and some integration code still use require() in places — allow it
    '@typescript-eslint/no-var-requires': 'off',
    // Allow any in the codebase for now to speed remediation; teams should progressively tighten this
    '@typescript-eslint/no-explicit-any': 'off',
    // Prefer explicit function types but don't block productivity in some helpers
    '@typescript-eslint/ban-types': ['error', { 'types': { 'Function': false }, 'extendDefaults': true }],
    // Relax constant condition checks in TUI loops and dev scaffolding
    'no-constant-condition': 'off',
    // Allow non-null assertions in places where they are safe and intended
    '@typescript-eslint/no-non-null-assertion': 'off'
  },
  overrides: [
    {
      files: ['tests/**/*.ts', 'tests/**/*.js', '**/*.test.ts', '**/*.spec.ts'],
      rules: {
        // Tests may use older patterns and helpers; keep lint noise low
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-namespace': 'off'
      }
    }
  ]
};
