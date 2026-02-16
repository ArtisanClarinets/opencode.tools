Based on my research of OpenCode's architecture and Fortune 500 enterprise AI governance standards, here is your comprehensive **AGENTS.md**:

---

```markdown
# AGENTS.md: OpenCode Enterprise Agent & Tool Governance Standard
## Fortune 500 / Global Enterprise Compliance Edition v1.0

**Classification:** Internal Use Only  
**Effective Date:** 2026-01-24  
**Review Cycle:** Quarterly  
**Owner:** Enterprise AI Governance Committee  
**Mandate:** This document establishes mandatory standards for all AI agent development, tool creation, and operational deployment within the OpenCode CLI/TUI ecosystem. Non-compliance requires CISO and Chief AI Officer escalation.

---

## 1. Executive Governance Framework

### 1.1 Corporate Mandate
OpenCode is classified as a **Mission-Critical AI Infrastructure Platform** requiring:
- SOC 2 Type II compliance for all agent operations
- GDPR Article 22 (automated decision-making) safeguards
- EU AI Act high-risk system protocols (where applicable)
- Zero Trust Architecture (ZTA) enforcement
- Immutable audit trails for all agent actions

### 1.2 Risk Classification Matrix

| Agent Type | Autonomy Level | Human Oversight | Deployment Zone |
|------------|---------------|-----------------|-----------------|
| **Plan** | Read-only | Asynchronous monitoring | Standard |
| **Build** | Destructive | Real-time approval gates | Restricted |
| **Subagent** | Task-scoped | Parent agent supervision | Isolated |
| **MCP-Integrated** | External system access | Mandatory HITL* | Secure Enclave |

*HITL = Human-in-the-Loop

### 1.3 Zero Trust Principles
1. **Never trust, always verify** - Every tool invocation requires identity validation
2. **Least privilege** - Agents receive minimum necessary tool access (explicit whitelist)
3. **Assume breach** - All agent actions monitored for anomalous patterns
4. **Verify explicitly** - Continuous authentication via short-lived tokens

---

## 2. Core Architecture: Enterprise Agent Operating System

### 2.1 Architectural Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  Go-based TUI → HTTP/SSE → Stainless SDK Client             │
├─────────────────────────────────────────────────────────────┤
│                   ORCHESTRATION LAYER                        │
│  Bun Runtime + Hono Server + Session Management             │
├─────────────────────────────────────────────────────────────┤
│                     AGENT LAYER                              │
│  Plan Agent │ Build Agent │ Subagent Registry │ MCP Clients  │
├─────────────────────────────────────────────────────────────┤
│                      TOOL LAYER                              │
│  FileOps │ Bash │ LSP │ WebFetch │ Task │ Custom Tools      │
├─────────────────────────────────────────────────────────────┤
│                   GOVERNANCE LAYER                           │
│  Audit Logger │ Policy Engine │ Secret Manager │ IAM Broker  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Enterprise Component Registry

All components must register in `.opencode/enterprise-registry.yaml`:

```yaml
components:
  tools:
    - name: string  # Globally unique identifier
      classification: [destructive|read-only|network-external]
      owner: string  # Team email
      compliance_review_date: ISO8601
      data_residency: [US|EU|APAC]
      
  agents:
    - name: string
      autonomy_level: [autonomous|supervised|approval-required]
      mcp_servers: []  # Restricted external connections
      allowed_data_classes: [public|internal|confidential|restricted]
```

---

## 3. Tool Creation Standard (Atomic Operations)

### 3.1 Enterprise Tool Interface Contract

All tools must implement `EnterpriseOpencodeTool` extending base functionality:

```typescript
// Enterprise Tool Interface - Strict Compliance Required
interface EnterpriseOpencodeTool {
  // Core Identification
  name: string;  // PascalCase, descriptive (e.g., "SecureDatabaseQuery")
  version: string;  // Semantic versioning (e.g., "1.2.0")
  classification: 'destructive' | 'read-only' | 'network-external';
  
  // Governance Metadata
  owner: string;  // Responsible team/individual
  complianceFrameworks: ('GDPR' | 'HIPAA' | 'SOX' | 'PCI-DSS')[];
  dataResidency: string[];  // Allowed regions
  
  // Security Schema
  schema: ZodSchema;  // Strict validation - no any types allowed
  secrets: string[];  // Required env var keys (e.g., ["DB_PASSWORD"])
  
  // Execution with Governance
  execute: (args: unknown, context: ExecutionContext) => Promise<ToolResult>;
  
  // Audit Requirements
  auditLevel: 'full' | 'metadata-only' | 'none';  // 'none' requires CTO approval
  
  // Safety Controls
  maxExecutionTimeMs: number;  // Hard timeout
  allowedEnvironments: ('dev' | 'staging' | 'prod')[];
  requiresApproval: boolean;  // Human-in-the-loop gate
  
  // Rollback Capability (for destructive tools)
  rollback?: (snapshotId: string) => Promise<void>;
}
```

### 3.2 Schema-First Design (Zod Enforcement)

**Mandatory:** All tool inputs must use Zod with strict validation:

```typescript
import { z } from 'zod';

// Example: Enterprise Database Query Tool
const SecureQuerySchema = z.object({
  query: z.string()
    .min(1)
    .max(10000)
    .regex(/^(SELECT|INSERT|UPDATE|DELETE)\s/i, "Only CRUD operations allowed")
    .refine(q => !q.includes(';'), "Multiple statements prohibited"),
    
  database: z.enum(['customer_db', 'analytics_db', 'audit_db']),
  
  timeout: z.number().int().max(30000).default(5000),
  
  piiMasking: z.boolean().default(true),  // GDPR compliance
  
  auditContext: z.object({
    requestId: z.string().uuid(),
    userId: z.string(),
    businessJustification: z.string().min(10)
  })
});

type SecureQueryParams = z.infer<typeof SecureQuerySchema>;
```

### 3.3 Tool Security Requirements

#### 3.3.1 Input Sanitization
- All inputs validated against Zod schema before execution
- SQL injection prevention via parameterized queries only
- Path traversal protection (mandatory `path.isAbsolute` check)
- Command injection prevention (no shell interpolation)

#### 3.3.2 Output Handling
- PII detection and masking before returning to LLM
- Binary file handling restrictions
- Size limits enforced (max 2000 lines for text, configurable)
- Error messages must not leak sensitive information

#### 3.3.3 Destructive Tool Protocols
Tools with `isDestructive: true` must implement:

1. **Pre-execution Snapshot** (Git-based):
```typescript
const snapshot = await GitSnapshot.create();
try {
  await executeDestructiveOperation();
} catch (error) {
  await GitSnapshot.restore(snapshot.id);
  throw new RollbackError(error);
}
```

2. **Approval Gates**:
```typescript
if (tool.requiresApproval) {
  const approval = await ApprovalGate.request({
    toolName: this.name,
    args: sanitizedArgs,
    requestor: context.userId,
    riskScore: calculateRiskScore(args)
  });
  
  if (!approval.granted) {
    throw new ApprovalDeniedError();
  }
}
```

### 3.4 Built-in Tool Governance

#### File Operations (Read/Write/Edit)
- **Path Validation**: All paths must resolve within `Instance.directory`
- **Binary Detection**: Automatic binary file blocking
- **LSP Integration**: Post-edit diagnostic validation required

#### Bash Tool
- **Command Allowlisting**: Only pre-approved commands (no `rm -rf`, `curl | bash`)
- **Timeout Enforcement**: Default 30s, max 5 minutes
- **Environment Isolation**: Clean env vars, no secret leakage

#### WebFetch Tool
- **Domain Allowlist**: Only approved domains (configured in `config.yaml`)
- **Data Loss Prevention**: Scan for PII before returning content
- **TLS Verification**: Strict certificate validation

#### Task Tool (Subagent Invocation)
- **Delegation Chain Tracking**: Maintain full lineage of agent calls
- **Permission Inheritance**: Subagent cannot exceed parent permissions
- **Concurrent Limits**: Max 5 parallel subagents per session

---

## 4. Agent Creation Standard (LLM Personas)

### 4.1 Agent Definition Format

Agents defined in `.opencode/agents/<agent-name>.md` with mandatory frontmatter:

```markdown
---
name: security-auditor
description: Performs security audits on code changes
mode: [primary|subagent]
classification: restricted  # [standard|restricted|critical]

# Model Configuration (MCP)
model:
  provider: anthropic
  modelId: claude-sonnet-4-20250514
  temperature: 0.1  # Low for consistency
  maxTokens: 4096
  
# Tool Governance
tools:
  read: true
  write: false
  edit: false
  bash: 
    allowed: true
    commands: ['grep', 'find', 'npm', 'node']  # Explicit allowlist
  task: true
  
# Security Context
security:
  dataAccess: [public, internal]  # No confidential/restricted
  networkAccess: false
  destructiveAllowed: false
  
# Compliance
compliance:
  piiHandling: mask
  auditLevel: full
  retentionDays: 90
  
# Human-in-the-Loop
hitl:
  requiredFor: [destructive-operations, external-api-calls]
  autoApproveReadOnly: true
---

# Security Auditor Agent

## Role
You are a security-focused code reviewer specializing in OWASP Top 10 and CWE vulnerabilities.

## Constraints
- NEVER modify code (read-only agent)
- ALWAYS report findings in structured format
- FLAG any hardcoded secrets immediately
```

### 4.2 Agent Inheritance Hierarchy

```typescript
// Abstract Base - Enterprise Compliance
abstract class EnterpriseAgent {
  abstract readonly name: string;
  abstract readonly classification: AgentClassification;
  abstract readonly systemPromptKey: string;
  
  // Security Context
  readonly allowedTools: ToolWhitelist;
  readonly dataAccessLevel: DataClassification;
  readonly maxDelegationDepth: number = 3;
  
  // Lifecycle Hooks
  abstract onInitialize(): Promise<void>;
  abstract onValidateContext(ctx: ExecutionContext): Promise<boolean>;
  abstract onComplete(result: TaskResult): Promise<void>;
  
  // Compliance
  abstract generateAuditLog(): AuditEntry;
  abstract validateCompliance(): ComplianceReport;
}

// Primary Agent (Plan/Build)
abstract class PrimaryAgent extends EnterpriseAgent {
  readonly mode: 'plan' | 'build';
  readonly canDelegate: boolean = true;
}

// Subagent (Task-scoped)
abstract class Subagent extends EnterpriseAgent {
  readonly mode: 'subagent';
  readonly parentAgent: string;
  readonly taskTimeout: number = 300000;  // 5 min default
  readonly canDelegate: boolean = false;  // No recursive delegation
}
```

### 4.3 Agent Mode Specifications

#### Plan Agent (Read-Only)
- **Purpose**: Analysis, architecture, documentation
- **Tool Restrictions**: No write/edit/bash destructive
- **Autonomy**: High (no HITL required)
- **Audit Level**: Metadata-only

#### Build Agent (Destructive)
- **Purpose**: Code generation, refactoring, deployment
- **Tool Restrictions**: Full tool access with approval gates
- **Autonomy**: Medium (HITL for destructive operations)
- **Audit Level**: Full (input/output/ reasoning)

#### Subagent (Task-Scoped)
- **Purpose**: Specialized tasks (security audit, testing)
- **Tool Restrictions**: Inherits from parent, cannot escalate
- **Autonomy**: Low (parent supervision)
- **Audit Level**: Full with parent correlation

---

## 5. Configuration Governance: Enterprise Layered Model

### 5.1 Configuration Precedence (Strict Hierarchy)

| Precedence | Source | Governance | Override Capability |
|------------|--------|------------|---------------------|
| **1** | **Emergency Override** | CISO/CAO only | Incident response |
| **2** | **Command-Line Flags** | Authenticated user | Session-only |
| **3** | **Project Config** | `.opencode/config.yaml` | Project-level |
| **4** | **Enterprise Policy** | `.opencode/enterprise-policy.yaml` | Org-mandated |
| **5** | **Global User Config** | `~/.opencode/config.yaml` | Personal defaults |
| **6** | **Agent Default** | Agent markdown frontmatter | Immutable |

### 5.2 Enterprise Policy Configuration

`.opencode/enterprise-policy.yaml` (Version Controlled, Immutable):

```yaml
policyVersion: "2026.1"
enforcement: strict  # [strict|warn|audit]

security:
  zeroTrust: true
  mfaRequired: true
  sessionTimeout: 3600  # 1 hour
  
  # Secret Management
  secrets:
    provider: hashicorp-vault  # [aws-secrets-manager|azure-keyvault|gcp-secret-manager]
    rotationDays: 90
    auditAccess: true
    
  # Network
  allowedDomains:
    - github.com
    - npmjs.com
    - api.openai.com
  blockedDomains:
    - pastebin.com
    - file-sharing sites
    
compliance:
  gdpr:
    piiDetection: true
    dataResidency: EU
    rightToDeletion: true
    
  hipaa:
    phiMasking: true
    auditLogRetention: 7years
    
  sox:
    financialDataLogging: true
    changeApprovalRequired: true

tools:
  globalRestrictions:
    bash:
      blockedCommands: ['rm -rf', 'curl | sh', 'wget | bash']
      allowedPaths: ['/tmp', '/workspace']
      
    write:
      protectedExtensions: ['.env', '.key', '.pem']
      requireApproval: true

agents:
  # Mandatory subagents for compliance
  requiredReviewers:
    security: security-auditor
    compliance: compliance-checker
    
  # Autonomy limits
  maxSubagentDepth: 3
  concurrentSubagents: 5
```

### 5.3 Prompt Store Management

**Centralized Prompt Repository** (GitOps workflow):

```
config/
└── prompt-store/
    ├── production/
    │   ├── agents/
    │   │   ├── security-auditor-v2.1.yaml
    │   │   └── build-agent-v3.0.yaml
    ├── staging/
    └── archive/
```

**Versioning Requirements:**
- Semantic versioning (MAJOR.MINOR.PATCH)
- Major version = breaking behavioral changes
- Git commit SHA reference in agent logs
- Rollback capability to previous versions

---

## 6. MCP (Model Context Protocol) Enterprise Integration

### 6.1 MCP Server Governance

All MCP servers must be registered and approved:

```yaml
# .opencode/mcp-registry.yaml
servers:
  production-database:
    endpoint: https://db-mcp.company.internal
    auth:
      type: oauth2
      clientId: ${DB_MCP_CLIENT_ID}
      clientSecret: ${DB_MCP_CLIENT_SECRET}
    compliance:
      dataResidency: US
      encryption: TLS1.3
    allowedTools:
      - query_readonly
      - schema_inspect
    blockedTools:
      - admin_drop_table
      
  jira-integration:
    endpoint: https://jira-mcp.company.internal
    rateLimit: 100/hour
    audit: full
```

### 6.2 MCP Security Requirements

1. **Authentication**: OAuth 2.1 or mTLS (no API keys in plaintext)
2. **Authorization**: Per-tool RBAC with user impersonation
3. **Audit**: All MCP calls logged with correlation IDs
4. **Network**: Private endpoints or VPN-required
5. **Data Validation**: Schema validation on all inputs/outputs

### 6.3 MCP Tool Shadowing Prevention

To prevent malicious MCP servers from overriding built-in tools:

```typescript
// Tool resolution priority
const toolResolutionOrder = [
  'built-in',      // OpenCode native tools (highest trust)
  'enterprise',    // Company-approved custom tools
  'mcp-verified',  // MCP servers in allowlist
  'mcp-unverified' // Requires explicit user approval
];
```

---

## 7. Observability & Audit Architecture

### 7.1 Structured Logging Format

All agent actions emit JSON logs:

```json
{
  "timestamp": "2026-01-24T10:15:30Z",
  "level": "info",
  "eventType": "tool_execution",
  "traceId": "abc-123-def",
  "sessionId": "sess-xyz-789",
  "agent": {
    "name": "build-agent",
    "mode": "build",
    "version": "3.0.1"
  },
  "tool": {
    "name": "edit",
    "classification": "destructive",
    "durationMs": 150
  },
  "context": {
    "userId": "user@company.com",
    "project": "payment-service",
    "environment": "production"
  },
  "input": {
    "filePath": "/workspace/src/config.ts",
    "operation": "update"
    // Actual content hashed for privacy
  },
  "output": {
    "status": "success",
    "linesChanged": 5
  },
  "compliance": {
    "piiDetected": false,
    "approvalRequired": true,
    "approvalGrantedBy": "lead@company.com"
  }
}
```

### 7.2 Real-Time Monitoring Dashboards

**Key Metrics:**
- Agent execution rate (requests/minute)
- Tool failure rate by type
- Average session duration
- Cost per session (LLM tokens + compute)
- Security incidents (blocked operations)
- Queue depth for HITL approvals

**Alerting Thresholds:**
- Destructive operation failure rate > 1%
- MCP server response time > 5s
- Unapproved tool access attempts
- PII detection in outputs

### 7.3 Audit Trail Requirements

**Retention:**
- Metadata logs: 7 years (SOX compliance)
- Full input/output: 90 days (GDPR)
- Session recordings: 30 days

**Immutability:**
- Write-once storage (WORM)
- Blockchain anchoring for critical operations
- Quarterly integrity verification

---

## 8. Incident Response & Business Continuity

### 8.1 Agent Kill Switch

Emergency procedures for malfunctioning agents:

```bash
# Immediate halt of specific agent
opencode emergency-halt --agent <name> --reason "Security incident #1234"

# Global pause (CISO only)
opencode emergency-halt --global --reason "Active breach investigation"
```

### 8.2 Rollback Procedures

**Automatic Snapshots:**
- Git tree state captured before every destructive operation
- 30-day retention of snapshots
- One-command rollback: `opencode rollback --to <snapshot-id>`

**Disaster Recovery:**
- Daily backups of session state
- Cross-region replication
- RTO: 1 hour, RPO: 15 minutes

### 8.3 Security Incident Response

**Severity Levels:**
- **Critical**: Agent exfiltrating data, unauthorized destructive access
- **High**: Policy violation, unauthorized MCP access
- **Medium**: Performance degradation, tool failure
- **Low**: Non-compliance with naming conventions

**Response Playbook:**
1. **Detect**: Automated alerts + manual reporting
2. **Contain**: Halt agent, revoke tokens, isolate session
3. **Investigate**: Forensic analysis of logs
4. **Recover**: Rollback changes, patch vulnerability
5. **Review**: Post-mortem within 24 hours (critical) or 1 week (high)

---

## 9. Development Lifecycle & CI/CD Integration

### 9.1 Agent Development Workflow

1. **Local Development**: Agent markdown files in `.opencode/agents/`
2. **Testing**: Automated validation of schema, compliance checks
3. **Review**: Security + compliance team approval required
4. **Staging**: Deployment to non-production environment
5. **Production**: Blue-green deployment with canary analysis

### 9.2 Pre-Deployment Checklist

- [ ] Zod schemas validated (no `any` types)
- [ ] Security review completed (OWASP Top 10 check)
- [ ] Compliance tags applied (GDPR, HIPAA, etc.)
- [ ] Audit logging implemented
- [ ] Rollback tested
- [ ] Documentation updated
- [ ] Runbook created for on-call

### 9.3 Automated Governance Gates

```yaml
# .github/workflows/agent-governance.yml
name: Agent Compliance Check
on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Schema Validation
        run: opencode validate-schemas --strict
        
      - name: Security Scan
        run: opencode security-scan --owasp --cwe
        
      - name: Compliance Check
        run: opencode compliance-check --gdpr --hipaa --sox
        
      - name: Policy Enforcement
        run: opencode policy-check --against enterprise-policy.yaml
```

---

## 10. Compliance & Regulatory Alignment

### 10.1 GDPR Compliance (Article 22)

- **Right to Explanation**: All agent decisions logged with reasoning
- **Human Override**: HITL gates for significant automated decisions
- **Data Minimization**: Automatic PII masking in logs
- **Deletion**: Right to be forgotten implemented via `opencode purge-session`

### 10.2 HIPAA Compliance

- **PHI Handling**: Agents processing health data run in secure enclave
- **Access Logging**: All PHI access logged with user identification
- **Encryption**: At-rest and in-transit (AES-256, TLS 1.3)
- **BAA**: Business Associate Agreements required for MCP servers

### 10.3 SOX Compliance

- **Change Management**: All agent changes require approval workflow
- **Segregation of Duties**: Plan agents cannot deploy; Build agents cannot approve
- **Audit Trails**: Immutable logs of all financial data access
- **Access Controls**: Role-based permissions for agent operations

### 10.4 EU AI Act (High-Risk Systems)

- **Risk Management**: Continuous monitoring for bias and errors
- **Data Governance**: Training data quality standards
- **Transparency**: Clear labeling of AI-generated content
- **Human Oversight**: Meaningful human control mechanisms
- **Accuracy**: Regular testing and validation

---

## 11. Best Practices & Anti-Patterns

### 11.1 Design Patterns

✅ **Do:**
- Design tools around **outcomes**, not operations (e.g., `deployService` vs `runKubectlApply`)
- Use **flat arguments** with Zod enums instead of nested objects
- Implement **idempotency** keys for all destructive operations
- Provide **dry-run modes** for dangerous operations
- Include **business context** in all tool executions (justification, ticket ID)

❌ **Don't:**
- Expose generic tools (raw SQL, arbitrary bash) without restrictions
- Allow agents to access secrets directly (use secret injection)
- Enable recursive subagent delegation beyond depth 3
- Log PII in plaintext
- Use `any` types in TypeScript schemas

### 11.2 Prompt Engineering Standards

- **System prompts** must include compliance reminders
- **Few-shot examples** for complex tools
- **Error messages** as instructions (guide agent to self-correct)
- **Context windows** managed via automatic summarization at 90% capacity

### 11.3 Performance Optimization

- **Tool batching**: Read multiple files in parallel
- **LSP caching**: Keep language servers warm
- **MCP connection pooling**: Reuse connections to external services
- **Session pruning**: Archive old sessions to cold storage

---

## 12. Appendix

### 12.1 Glossary

- **HITL**: Human-in-the-Loop
- **MCP**: Model Context Protocol
- **ZTA**: Zero Trust Architecture
- **PII**: Personally Identifiable Information
- **PHI**: Protected Health Information
- **RBAC**: Role-Based Access Control
- **ABAC**: Attribute-Based Access Control

### 12.2 Reference Implementations

```typescript
// Example: Enterprise-Grade Database Query Tool
export const SecureDatabaseQueryTool = Tool.define(
  "secureDatabaseQuery",
  {
    description: "Executes read-only SQL queries against approved databases",
    classification: "read-only",
    compliance: ["GDPR", "SOX"],
    
    parameters: z.object({
      query: z.string()
        .regex(/^SELECT\s/i, "Only SELECT statements allowed")
        .max(5000),
        
      database: z.enum(["analytics_ro", "reporting_ro"]),
      
      businessJustification: z.string().min(20),
      
      maskingRules: z.object({
        ssn: z.boolean().default(true),
        email: z.boolean().default(true),
        creditCard: z.boolean().default(true)
      })
    }),
    
    async execute(params, context) {
      // 1. Validate approval
      await ApprovalGate.check(context, params);
      
      // 2. Execute with timeout
      const result = await Promise.race([
        db.query(params.query),
        timeout(30000)
      ]);
      
      // 3. Apply masking
      const masked = applyMasking(result, params.maskingRules);
      
      // 4. Audit log
      await AuditLog.write({
        tool: "secureDatabaseQuery",
        user: context.userId,
        justification: params.businessJustification,
        rowsReturned: masked.length
      });
      
      return masked;
    }
  }
);
```

### 12.3 Emergency Contacts

- **Security Incidents**: security@company.com / +1-555-SEC-HELP
- **Compliance Questions**: compliance@company.com
- **Technical Support**: ai-platform@company.com
- **After Hours**: On-call rotation via PagerDuty

---

**Document Control:**
- Version: 1.0.0
- Last Updated: 2026-01-24
- Next Review: 2026-04-24
- Approved By: Chief AI Officer, CISO, Chief Compliance Officer
```

---
