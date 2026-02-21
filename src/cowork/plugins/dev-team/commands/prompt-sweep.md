# Prompt Sweep Command

## Metadata
- **ID**: prompt-sweep
- **Name**: Prompt Sweep
- **Description**: Generate end-to-end prompt packs for a complete task implementation in one sweep
- **Allowed Tools**: read, write, edit, bash, fs.read, fs.list

## Command Body

Execute a comprehensive prompt sweep to generate complete, production-ready prompt packs for autonomous implementation.

### Usage

```
/prompt-sweep <task-description> [--scope=feature|module|project] [--output-dir=./prompts]
```

### Execution Steps

1. **Analyze Task Scope**
   - Parse the task description
   - Identify affected files and modules
   - Determine dependencies and ordering

2. **Generate Repository Analysis**
   - Scan relevant files for context
   - Identify patterns and conventions
   - Map file relationships

3. **Create Prompt Pack**
   - Generate individual prompts for each subtask
   - Order prompts by dependency
   - Include full context for each prompt

4. **Apply Quality Standards**
   - No TODO comments
   - No truncated code
   - Security-first approach
   - Complete implementations

5. **Output Prompt Pack**
   - Save to specified output directory
   - Include execution order manifest
   - Provide verification commands

### Prompt Pack Structure

```
prompts/
├── manifest.json          # Execution order and metadata
├── 01-setup.md           # Initial setup prompt
├── 02-core-impl.md       # Core implementation prompt
├── 03-tests.md           # Test implementation prompt
├── 04-integration.md     # Integration prompt
└── 05-verification.md    # Final verification prompt
```

### Manifest Format

```json
{
  "taskDescription": "...",
  "createdAt": "2024-01-15T10:00:00Z",
  "prompts": [
    {
      "order": 1,
      "file": "01-setup.md",
      "agent": "implementer",
      "description": "Initial project setup"
    }
  ],
  "verification": {
    "commands": ["npm test", "npm run lint"],
    "expectedOutcome": "All tests pass, no lint errors"
  }
}
```

### Agent Assignments

- **Setup/Configuration**: implementer
- **Core Implementation**: implementer
- **Tests**: qa
- **Security Review**: security
- **Documentation**: docs

### Example

```
/prompt-sweep "Add user authentication with OAuth2 support" --scope=feature
```

This generates a complete prompt pack for implementing OAuth2 authentication, including:
- Database schema setup
- OAuth provider integration
- Session management
- Security hardening
- Test coverage
- Documentation

### Notes

- All prompts are sent to CTO for approval before distribution
- Each prompt is self-contained with full context
- Prompts are ordered to respect dependencies
- Verification commands are included in each prompt

---

**Communication**: This command reports results to the CTO Orchestrator only.
