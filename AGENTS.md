# AGENTS.md: OpenCode Tools Developer Guide
## Coding Standards & Development Workflow

**Purpose**: This document establishes coding conventions, build commands, and development workflows for OpenCode Tools contributors and AI coding agents.

---

## Quick Reference Commands

### Build & Development
```bash
# Build TypeScript project
npm run build

# Run in development mode
npm run dev

# Full validation (lint + build + test)
npm run validate
```

### Linting & Code Quality
```bash
# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint:fix

# TypeScript type check
npx tsc --noEmit
```

### Testing
```bash
# Run all tests with coverage
npm test

# Run specific test file
npm test -- agents/research/research-agent.test.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run security tests
npm run test:security

# Run performance tests
npm run test:performance

# Run all test types
npm run test:all
```

### Agent-Specific Commands

All agents are accessed via the main TUI application:
```bash
npm run tui
```

For testing individual agents during development, refer to their specific test suites (e.g., `tests/agents/research-agent.test.ts`).

---

## Code Style Guidelines

### TypeScript Configuration

**tsconfig.json** enforces strict type safety:
- `strict: true` - No implicit any, strict null checks, strict function types
- `target: ES2020` - Modern JavaScript features
- `module: commonjs` - Node.js compatibility (not ES modules)
- `declaration: true` - Generate .d.ts files for libraries
- `skipLibCheck: true` - Skip type checking of declaration files (performance)

**Key Rule**: Always prefer explicit types over `any`. The codebase uses `@typescript-eslint/no-explicit-any: warn`.

### Import Conventions

**Absolute imports only** - No relative paths:

```typescript
// ✅ CORRECT - Absolute imports
import { ResearchAgent } from 'agents/research/research-agent';
import { AuditLogger } from 'src/runtime/audit';
import { webfetch } from 'tools/webfetch';

// ❌ WRONG - Relative imports
import { ResearchAgent } from '../../agents/research/research-agent';
import { AuditLogger } from '../runtime/audit';
```

**Module path mappings** are configured in:
- `tsconfig.json`/`jest.config.js` mappings
- Use `@/` prefix for src: `import '@/types'` → `src/types`

### Naming Conventions

**Classes**: PascalCase, descriptive, suffix with pattern:
```typescript
class ResearchAgent { }
class AuditLogger { }
class PolicyViolationError extends BaseError { }
```

**Interfaces**: PascalCase, prefix with `I` for interfaces:
```typescript
interface IAgent { }
interface LLMProvider { }
```

**Functions/Methods**: camelCase, action-oriented:
```typescript
async function executeResearch(input: ResearchInput): Promise<ResearchOutput> { }
private validateInput(params: any): ValidationResult { }
```

**Constants**: UPPER_SNAKE_CASE:
```typescript
const MAX_RETRIES = 5;
const DEFAULT_TIMEOUT_MS = 30000;
```

**Enums**: PascalCase enum name, UPPER_SNAKE_CASE values:
```typescript
enum AgentPermission {
  RESEARCH_EXECUTE = 'research:execute',
  ADMIN_MANAGE_USERS = 'admin:manage_users'
}
```

**Files**: kebab-case for files, match exported class:
```typescript
// File: agents/research/research-agent.ts
export class ResearchAgent { }
```

### Type Conventions

**Prefer interfaces over type aliases** for object shapes:
```typescript
// ✅ CORRECT
interface ResearchInput {
  brief: ClientBrief;
  keywords: string[];
}

// Acceptable for unions/primitives
type UserRole = 'viewer' | 'researcher' | 'admin';
```

**Generic types** with meaningful constraints:
```typescript
// ✅ CORRECT
class Result<TSuccess, TError> {
  constructor(
    public success: boolean,
    public data?: TSuccess,
    public error?: TError
  ) { }
}
```

**Explicit return types** on public functions:
```typescript
// ✅ CORRECT
public async execute(input: ResearchInput): Promise<ResearchOutput> {
  // implementation
}
```

### Error Handling Patterns

**Custom error classes** extending BaseError:
```typescript
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
```

**Error metadata** for enterprise tracking:
```typescript
export interface ErrorMetadata {
  category: ErrorCategory;
  code: ErrorCode;
  severity: 'low' | 'medium' | 'high' | 'critical';
  agentName?: string;
  operation?: string;
  retryable: boolean;
  retryConfig?: RetryConfig;
  context?: Record<string, any>;
  correlationId?: string;
}

export class EnterpriseError extends Error {
  constructor(
    message: string,
    public metadata: ErrorMetadata,
    public cause?: Error
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**Never swallow errors** - Always provide context:
```typescript
// ✅ CORRECT
try {
  await this.searchWeb(query);
} catch (error) {
  throw new TransientError(
    `Search failed for query: ${query}`,
    ErrorCode.NETWORK_ERROR,
    'search_web',
    { query, queryId },
    error
  );
}

// ❌ WRONG
try {
  await this.searchWeb(query);
} catch (error) {
  return []; // Hides the error!
}
```

### Async/Await Patterns

**Always use async/await** over raw promises:
```typescript
// ✅ CORRECT
async function fetchData(): Promise<Data> {
  const response = await fetch(url);
  return await response.json();
}

// ❌ WRONG
then(response => response.json()).then(data => { ... });
```

**Parallel operations** with Promise.all:
```typescript
// ✅ CORRECT
const [companyData, industryData] = await Promise.all([
  this.gatherCompanyData(input),
  this.gatherIndustryData(input)
]);
```

**Timeout handling**:
```typescript
const timeout = new Promise<never>((_, reject) => {
  setTimeout(() => reject(new Error('Timeout')), 5000);
});

return await Promise.race([promise, timeout]);
```

### Validation & Schemas

**Zod schemas** for all inputs:
```typescript
import { z } from 'zod';

export const ResearchInputSchema = z.object({
  brief: z.object({
    company: z.string().min(1).max(200),
    industry: z.string().min(1).max(200),
    goals: z.array(z.string()).max(50)
  }),
  keywords: z.array(z.string()).max(100)
});

type ResearchInput = z.infer<typeof ResearchInputSchema>;
```

**Parse, don't validate**:
```typescript
// ✅ CORRECT
const result = ResearchInputSchema.safeParse(input);
if (!result.success) {
  throw new ValidationError('Invalid input', result.error);
}
return result.data; // Type-safe
```

### Testing Conventions

**Test file location**: Co-located with source files:
```
agents/research/research-agent.ts
agents/research/research-agent.test.ts
```

**Test structure**:
```typescript
describe('ResearchAgent', () => {
  let agent: ResearchAgent;
  let mockProvider: MockSearchProvider;
  
  beforeEach(() => {
    mockProvider = new MockSearchProvider();
    agent = new ResearchAgent(mockProvider);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('execute', () => {
    it('should return dossier with company summary', async () => {
      const input = { brief: { company: 'TestCo', industry: 'Tech' }, keywords: [] };
      const result = await agent.execute(input);
      
      expect(result.dossier.companySummary).toContain('TestCo');
      expect(result.sources).toHaveLength(5);
    });
    
    it('should throw ValidationError for invalid input', async () => {
      const invalidInput = { brief: {} };
      
      await expect(agent.execute(invalidInput as any))
        .rejects.toThrow(ValidationError);
    });
  });
});
```

**Coverage thresholds** (enforced in CI):
- Global: 70% branches, functions, lines, statements
- `./src/`: 80% all metrics
- `./agents/`: 75% all metrics

### Logging & Observability

**Structured logging** with Winston:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'research-agent' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

**Log context** for correlation:
```typescript
logger.info('Research started', {
  correlationId: context.correlationId,
  userId: context.userId,
  runId: context.runId,
  agent: 'research-agent',
  company: input.brief.company
});
```

### Data Redaction & Security

**Never log secrets** - Register for redaction:
```typescript
import { SecretRegistry } from 'src/security/secrets';
import { redactor } from 'src/security/redaction';

// Register secrets when initialized
const secretsManager = new SecretRegistry();
secretsManager.registerSecret(apiKey);

// Redact automatically
const redacted = redactor.redactObject({
  apiKey: 'sk-12345...',
  data: 'sensitive'
});
// Result: { apiKey: '[REDACTED]', data: 'sensitive' }
```

**Path validation** to prevent traversal:
```typescript
import { PathValidator } from 'src/security/validation';

const validator = new PathValidator('/workspace');
const safePath = validator.validatePath(requestedPath);
```

---

## Development Workflow

### Git Workflow

1. **Main branch**: `main` (protected, requires PR)
2. **Development**: `develop` (integration branch)
3. **Feature branches**: `feature/description` or `fix/description`

**Branch naming**:
- Feature: `feature/add-authentication`
- Fix: `fix/research-agent-timeout`
- Hotfix: `hotfix/security-vulnerability`
- Docs: `docs/update-readme`

### Commit Conventions

**Format**: `type(scope): description`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons
- `refactor`: Code restructuring
- `test`: Adding or fixing tests
- `chore`: Build process, tooling

Examples:
```bash
git commit -m "feat(auth): add OAuth2 authentication flow"
git commit -m "fix(research): resolve data race in search results"
git commit -m "docs(readme): update build instructions"
git commit -m "test(integration): add API key validation tests"
```

### Pull Request Process

**Before submitting**:
1. Run full validation: `npm run validate`
2. Ensure all tests pass
3. Check coverage: `npm run test:coverage`
4. Update documentation for public APIs

**PR requirements**:
- Descriptive title following commit convention
- Detailed description of changes
- Link to related issues
- Screenshots for UI changes (if applicable)
- All CI checks passing
- Code review approval from 1+ maintainer

**PR template fields**:
```markdown
## Changes
- List specific changes made

## Testing
- How were these changes tested?
- Any new tests added?

## Breaking Changes
- Any breaking changes for existing users?

## Checklist
- [ ] Tests passing
- [ ] Code coverage maintained
- [ ] Documentation updated
- [ ] Security review (if applicable)
```

### Code Review Guidelines

**As author**:
- Self-review before requesting review
- Respond to feedback within 2 business days
- Provide rationale for decisions
- Keep PRs focused (< 500 lines when possible)

**As reviewer**:
- Check for security vulnerabilities
- Verify test coverage for changes
- Ensure documentation is clear
- Validate error handling
- Check for performance implications

---

## IDE Configuration

### VS Code Settings

Create `.vscode/settings.json`:
```json
{
  "typescript.preferences.quoteStyle": "double",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["typescript"],
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.jest-cache": true
  }
}
```

### VS Code Extensions

Install these extensions:
- ESLint (Microsoft)
- Prettier (Prettier)
- Jest (Orta)
- GitLens (GitKraken)
- Thunder Client (Thunder Client)

---

## Resources

- **Architecture**: See `AGENTS.md` (agent catalog) and `ARCHITECTURE.md`
- **API Reference**: Generated TypeDoc in `docs/api/`
- **Security**: See `docs/security/` directory
- **Testing**: See `tests/TEST_IMPROVEMENT_PLAN.md`
- **CI/CD**: `.github/workflows/test-pipeline.yml`
- **Production Readiness**: `PRODUCTION_READINESS_ASSESSMENT.md`

### Getting Help

- Create an issue: https://github.com/opencode/ai-tool/issues
- Security issues: security@opencode.ai
- General questions: discussions on GitHub

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-01-24  
**Maintainer**: OpenCode Tools Team
