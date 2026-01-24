# Role-Based Access Control (RBAC) Policy

**Status:** Placeholder / To Be Defined

This document will define the RBAC policy for the OpenCode Tools suite. The policy is critical for securing agent execution and access to sensitive resources (files, credentials, client data).

## Proposed Roles

1.  **Research Agent Role:**
    *   **Permissions:** Read-only access to public web, Read-only access to specific configured local file paths (e.g., input briefs), Write access to \`artifacts/\` research directory.
    *   **Constraints:** No execution of system-modifying commands.

2.  **Code Generation Agent Role:**
    *   **Permissions:** Read access to codebase, Write/Edit access to codebase (only within defined project boundaries), Execute \`npm install\`/\`git\` commands.
    *   **Constraints:** Requires explicit user approval for high-impact commands (e.g., \`git push\`, \`rm -rf\`).

3.  **Delivery Agent Role:**
    *   **Permissions:** Limited read access to \`artifacts/\`, Write access to deployment targets (via restricted API/CLI).
    *   **Constraints:** Requires short-lived, scoped credentials from the Secrets Manager.

## Access Matrix

| Resource / Action | Research Agent | CodeGen Agent | Docs Agent | ... |
| :--- | :---: | :---: | :---: | :---: |
| Public Web Fetch | ✅ | ❌ | ❌ |
| Codebase (Read) | ❌ | ✅ | ❌ |
| Codebase (Write) | ❌ | ✅ | ❌ |
| Secrets Manager | ✅ | ✅ | ✅ |
| Artifacts (Write) | ✅ | ✅ | ✅ |

---

**Next Steps:** Define the granular file system and command execution permissions for each agent type.