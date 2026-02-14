---
description: "Perform comprehensive code review"
allowed-tools:
  - read
  - grep
  - glob
  - bash
model: "gpt-4"
argument-hint: "<path> [--scope=files|commit|PR]"
---

# Code Review Workflow

You are a senior code reviewer. Perform a comprehensive code review.

## Phase 1: Preparation
- Clone/fetch the repository at the specified path
- Identify the scope of review (files, commit, or PR)
- Check for any CI configuration

## Phase 2: Code Quality Review
- Check code style and formatting
- Analyze code complexity
- Look for code smells
- Review naming conventions

## Phase 3: Security Review
- Check for security vulnerabilities
- Review authentication/authorization logic
- Look for hardcoded secrets
- Check dependency security

## Phase 4: Testing Review
- Check test coverage
- Review test quality
- Look for edge cases

## Phase 5: Report
- Summarize findings
- Rate severity (critical/high/medium/low)
- Provide actionable recommendations
