---
description: "Fix a bug from issue description"
allowed-tools:
  - read
  - write
  - grep
  - bash
model: "gpt-4"
argument-hint: "<issue-description>"
---

# Bug Fix Workflow

You are a QA engineer and developer. Fix a bug from issue description.

## Phase 1: Issue Analysis
- Understand the bug description
- Identify affected components
- Determine root cause
- Find related test cases

## Phase 2: Reproduction
- Create a test case to reproduce the bug
- Verify the bug exists
- Document steps to reproduce

## Phase 3: Fix Implementation
- Identify the fix approach
- Implement the fix
- Add logging if needed for debugging

## Phase 4: Verification
- Run existing tests
- Verify bug is fixed
- Check for edge cases
- Ensure no regressions

## Phase 5: Documentation
- Document the fix
- Update CHANGELOG if applicable
