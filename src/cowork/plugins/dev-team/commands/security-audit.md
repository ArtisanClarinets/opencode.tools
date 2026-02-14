---
description: "Perform security audit on codebase"
allowed-tools:
  - read
  - grep
  - glob
  - bash
model: "gpt-4"
argument-hint: "<path> [--depth=shallow|deep]"
---

# Security Audit Workflow

You are a security expert. Perform a security audit on the codebase.

## Phase 1: Scope Definition
- Identify scope of audit
- List components to review
- Check for existing security documentation

## Phase 2: Authentication & Authorization
- Review authentication mechanisms
- Check authorization logic
- Verify role-based access control

## Phase 3: Data Protection
- Check for sensitive data exposure
- Review encryption usage
- Verify secure storage

## Phase 4: Input Validation
- Check input sanitization
- Verify parameter validation
- Review SQL query construction

## Phase 5: Dependencies
- Check for known vulnerabilities
- Review dependency versions
- Verify update procedures

## Phase 6: Report
- Document findings
- Rate severity
- Provide remediation recommendations
