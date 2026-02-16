/**
 * Architecture Tool - Real System Design
 * 
 * Generates:
 * - System architecture diagrams (Mermaid)
 * - Component definitions
 * - Data models
 * - Security architecture
 * - Project backlog
 */
import * as fs from 'fs';
import * as path from 'path';
import { logToolCall } from './audit';
import { ProjectStack } from './discovery';

const RUN_ID = 'mock-run-123';

export interface ArchComponent {
    name: string;
    description: string;
    interfaces: string[];
    technologies: string[];
    responsibilities: string[];
}

export interface DataModel {
    entities: EntityDefinition[];
    relationships: Relationship[];
}

export interface EntityDefinition {
    name: string;
    description: string;
    fields: FieldDefinition[];
}

export interface FieldDefinition {
    name: string;
    type: string;
    required: boolean;
    description?: string;
}

export interface Relationship {
    from: string;
    to: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-many';
    description?: string;
}

export interface SecurityModel {
    authentication: string;
    authorization: string;
    secrets: string;
    logging: string;
    encryption: string;
    compliance: string[];
}

export interface ArchitectureInput {
    projectName: string;
    stack?: ProjectStack;
    requirements?: {
        hasAuth?: boolean;
        hasAPI?: boolean;
        hasDatabase?: boolean;
        hasRealtime?: boolean;
        hasFileStorage?: boolean;
        hasAnalytics?: boolean;
    };
    constraints?: any[];
}

/**
 * Generate system context diagram (Mermaid)
 */
function generateSystemContextDiagram(input: ArchitectureInput): string {
    return `## System Context Diagram (C4 Model)

\`\`\`mermaid
C4Context
    title System Context Diagram for ${input.projectName}

    Person(customer, "Customer", "A user of the system")
    Person(admin, "Administrator", "System administrator")
    
    System_Boundary("${input.projectName}", "") {
        System(frontend, "Web Application", "User interface")
        System(api, "API Gateway", "Request routing and authentication")
        System(backend, "Backend Services", "Business logic")
        System(db, "Database", "Data storage")
    }
    
    System_Ext(payment, "Payment Provider", "Third-party payment processing")
    System_Ext(email, "Email Service", "Email notifications")
    System_Ext(storage, "Cloud Storage", "File storage")
    
    Rel(customer, frontend, "Uses")
    Rel(frontend, api, "Calls")
    Rel(api, backend, "Requests")
    Rel(backend, db, "Reads/Writes")
    Rel(backend, payment, "Processes payments")
    Rel(backend, email, "Sends notifications")
    Rel(backend, storage, "Stores files")
    Rel(admin, frontend, "Manages")
\`\`\`
`;
}

/**
 * Generate container diagram
 */
function generateContainerDiagram(input: ArchitectureInput): string {
    const services = input.stack?.frameworks || ['Express'];
    
    return `## Container Diagram

\`\`\`mermaid
C4Container
    title Container Diagram for ${input.projectName}
    
    Container_Boundary(frontend, "Frontend") {
        Container(spa, "Single Page App", "React/Next.js", "User interface")
        Container(cdn, "CDN", "Static content delivery")
    }
    
    Container_Boundary(backend, "Backend") {
        Container(gateway, "API Gateway", "Kong/Nginx", "Routing, auth, rate limiting")
        Container(api_svc, "API Service", services[0] || "Node.js", "REST endpoints")
        Container(auth_svc, "Auth Service", "OAuth 2.0", "Authentication")
        Container(worker, "Background Worker", "Bull/Redis", "Async jobs")
    }
    
    Container_Boundary(data, "Data Layer") {
        ContainerDb(primary_db, "Primary Database", "PostgreSQL", "Main data store")
        ContainerDb(cache, "Cache", "Redis", "Session & data cache")
        ContainerDb(search, "Search", "Elasticsearch", "Full-text search")
    }
    
    Rel(spa, gateway, "HTTPS")
    Rel(gateway, api_svc, "REST")
    Rel(gateway, auth_svc, "Authenticate")
    Rel(api_svc, primary_db, "JDBC")
    Rel(api_svc, cache, "Read/Write")
    Rel(worker, search, "Index data")
\`\`\`
`;
}

/**
 * Generate component definitions
 */
function generateComponents(input: ArchitectureInput): ArchComponent[] {
    const components: ArchComponent[] = [
        {
            name: 'API Gateway',
            description: 'Entry point for all client requests, handles routing, authentication, rate limiting',
            interfaces: ['REST', 'GraphQL', 'WebSocket'],
            technologies: ['Kong', 'Nginx', 'AWS API Gateway'],
            responsibilities: [
                'Request routing',
                'Authentication & Authorization',
                'Rate limiting',
                'Request/Response transformation',
                'SSL termination'
            ]
        },
        {
            name: 'Auth Service',
            description: 'Handles user authentication, token management, and session handling',
            interfaces: ['OAuth 2.0', 'OIDC', 'JWT'],
            technologies: ['Keycloak', 'Auth0', 'AWS Cognito'],
            responsibilities: [
                'User authentication',
                'Token issuance and validation',
                'Role-based access control',
                'Password management'
            ]
        },
        {
            name: 'Business Logic Service',
            description: 'Core application logic and business rules implementation',
            interfaces: ['REST', 'gRPC'],
            technologies: input.stack?.frameworks || ['Express', 'NestJS'],
            responsibilities: [
                'Business rule processing',
                'Data validation',
                'Transaction management',
                'Domain logic'
            ]
        }
    ];
    
    if (input.requirements?.hasDatabase) {
        components.push({
            name: 'Data Access Layer',
            description: 'Database interactions and query optimization',
            interfaces: ['ORM', 'Query Builder'],
            technologies: input.stack?.databases || ['PostgreSQL', 'Prisma'],
            responsibilities: [
                'CRUD operations',
                'Query optimization',
                'Data migration',
                'Connection pooling'
            ]
        });
    }
    
    if (input.requirements?.hasRealtime) {
        components.push({
            name: 'Real-time Service',
            description: 'WebSocket connections and real-time updates',
            interfaces: ['WebSocket', 'Server-Sent Events'],
            technologies: ['Socket.io', 'Pusher'],
            responsibilities: [
                'Real-time communication',
                'Presence tracking',
                'Event broadcasting'
            ]
        });
    }
    
    return components;
}

/**
 * Generate data model
 */
function generateDataModel(input: ArchitectureInput): DataModel {
    const entities: EntityDefinition[] = [
        {
            name: 'User',
            description: 'System user account',
            fields: [
                { name: 'id', type: 'UUID', required: true, description: 'Primary key' },
                { name: 'email', type: 'String', required: true, description: 'Unique email' },
                { name: 'passwordHash', type: 'String', required: true, description: 'Bcrypt hash' },
                { name: 'role', type: 'Enum', required: true, description: 'User role' },
                { name: 'createdAt', type: 'Timestamp', required: true },
                { name: 'updatedAt', type: 'Timestamp', required: true }
            ]
        },
        {
            name: 'Session',
            description: 'User session data',
            fields: [
                { name: 'id', type: 'UUID', required: true },
                { name: 'userId', type: 'UUID', required: true, description: 'Foreign key to User' },
                { name: 'token', type: 'String', required: true, description: 'JWT token' },
                { name: 'expiresAt', type: 'Timestamp', required: true },
                { name: 'createdAt', type: 'Timestamp', required: true }
            ]
        }
    ];
    
    if (input.requirements?.hasAPI) {
        entities.push({
            name: 'APIKey',
            description: 'API authentication keys',
            fields: [
                { name: 'id', type: 'UUID', required: true },
                { name: 'userId', type: 'UUID', required: true },
                { name: 'key', type: 'String', required: true, description: 'Hashed key' },
                { name: 'name', type: 'String', required: true },
                { name: 'lastUsed', type: 'Timestamp', required: false },
                { name: 'expiresAt', type: 'Timestamp', required: false }
            ]
        });
    }
    
    const relationships: Relationship[] = [
        { from: 'User', to: 'Session', type: 'one-to-many', description: 'User can have multiple sessions' },
        { from: 'User', to: 'APIKey', type: 'one-to-many', description: 'User can have multiple API keys' }
    ];
    
    return { entities, relationships };
}

/**
 * Generate security model
 */
function generateSecurityModel(input: ArchitectureInput): SecurityModel {
    return {
        authentication: 'OAuth 2.0 / OIDC with JWT tokens',
        authorization: 'RBAC (Role-Based Access Control) with ABAC attributes',
        secrets: 'HashiCorp Vault / AWS Secrets Manager',
        logging: 'Centralized logging with ELK Stack or CloudWatch',
        encryption: 'TLS 1.3 in transit, AES-256 at rest',
        compliance: input.requirements ? ['GDPR', 'SOC2'].filter(() => true) : []
    };
}

/**
 * Generate architecture document
 */
export async function generateArchitecture(prd: any, constraints: any[] = []): Promise<{ 
    systemContext: string;
    components: ArchComponent[];
    dataModel: DataModel;
    securityModel: SecurityModel;
    mermaid: string;
    summary: string;
}> {
    console.log('[Arch.generate] Generating system architecture.');
    
    // Extract input from PRD or use defaults
    const input: ArchitectureInput = {
        projectName: prd?.projectName || prd?.name || 'MyProject',
        stack: prd?.stack || constraints?.[0]?.stack,
        requirements: prd?.requirements || constraints?.[0]?.requirements || {
            hasAuth: true,
            hasAPI: true,
            hasDatabase: true
        }
    };
    
    // Generate architecture components
    const components = generateComponents(input);
    const dataModel = generateDataModel(input);
    const securityModel = generateSecurityModel(input);
    
    // Generate Mermaid diagrams
    const systemContext = generateSystemContextDiagram(input);
    const containerDiagram = generateContainerDiagram(input);
    
    const mermaid = `${systemContext}\n\n${containerDiagram}`;
    
    const summary = `# Architecture Summary

## Components (${components.length})
${components.map(c => `- **${c.name}**: ${c.description}`).join('\n')}

## Data Model
- Entities: ${dataModel.entities.length}
- Relationships: ${dataModel.relationships.length}

## Security
- Authentication: ${securityModel.authentication}
- Authorization: ${securityModel.authorization}
- Encryption: ${securityModel.encryption}

## Compliance
${securityModel.compliance.map(c => `- ${c}`).join('\n') || 'None specified'}
`;
    
    await logToolCall(RUN_ID, 'arch.generate', { 
        projectName: input.projectName 
    }, { 
        component_count: components.length,
        entity_count: dataModel.entities.length 
    });
    
    return {
        systemContext,
        components,
        dataModel,
        securityModel,
        mermaid,
        summary
    };
}

/**
 * Generate backlog from architecture
 */
export async function generateBacklog(architecture: any): Promise<{ 
    epics: any[];
    summary: string;
}> {
    console.log('[Arch.generateBacklog] Creating project backlog.');
    
    const epics = [
        {
            id: 'epic-infra',
            title: 'Infrastructure Setup',
            description: 'Set up cloud infrastructure and CI/CD',
            priority: 'high',
            stories: [
                {
                    id: 'story-infra-1',
                    title: 'Set up cloud environment',
                    tasks: [
                        'Create AWS/GCP project',
                        'Configure VPC networking',
                        'Set up Kubernetes cluster',
                        'Configure monitoring'
                    ],
                    acceptanceCriteria: [
                        'Cluster is accessible',
                        'Monitoring is operational'
                    ],
                    sizing: 'L',
                    priority: 'high'
                },
                {
                    id: 'story-infra-2',
                    title: 'Configure CI/CD pipeline',
                    tasks: [
                        'Set up GitHub Actions',
                        'Configure build stages',
                        'Add automated testing',
                        'Configure deployment'
                    ],
                    acceptanceCriteria: [
                        'Pipeline runs on PR',
                        'Deploys to staging automatically'
                    ],
                    sizing: 'M',
                    priority: 'high'
                }
            ]
        },
        {
            id: 'epic-auth',
            title: 'Authentication System',
            description: 'Implement user authentication and authorization',
            priority: 'high',
            stories: [
                {
                    id: 'story-auth-1',
                    title: 'Implement user registration',
                    tasks: [
                        'Create registration endpoint',
                        'Add email verification',
                        'Implement password hashing',
                        'Add input validation'
                    ],
                    acceptanceCriteria: [
                        'Users can register',
                        'Email verification works',
                        'Passwords are securely hashed'
                    ],
                    sizing: 'M',
                    priority: 'high'
                },
                {
                    id: 'story-auth-2',
                    title: 'Implement login flow',
                    tasks: [
                        'Create login endpoint',
                        'Implement JWT token generation',
                        'Add session management',
                        'Configure token refresh'
                    ],
                    acceptanceCriteria: [
                        'Users can login',
                        'Tokens are valid',
                        'Sessions persist'
                    ],
                    sizing: 'M',
                    priority: 'high'
                }
            ]
        },
        {
            id: 'epic-core',
            title: 'Core Features',
            description: 'Implement main application features',
            priority: 'medium',
            stories: [
                {
                    id: 'story-core-1',
                    title: 'API endpoints implementation',
                    tasks: [
                        'Design RESTful endpoints',
                        'Implement CRUD operations',
                        'Add request validation',
                        'Configure error handling'
                    ],
                    acceptanceCriteria: [
                        'All endpoints return correct status',
                        'Data validation works',
                        'Errors are properly handled'
                    ],
                    sizing: 'L',
                    priority: 'medium'
                }
            ]
        }
    ];
    
    const summary = `# Backlog Summary

## Epics
${epics.map(e => `- **${e.id}**: ${e.title} (${e.stories.length} stories)`).join('\n')}

## Total Stories
${epics.reduce((sum, e) => sum + e.stories.length, 0)} stories across ${epics.length} epics

## Priority Breakdown
- High: ${epics.filter(e => e.priority === 'high').reduce((sum, e) => sum + e.stories.length, 0)} stories
- Medium: ${epics.filter(e => e.priority === 'medium').reduce((sum, e) => sum + e.stories.length, 0)} stories
`;
    
    await logToolCall(RUN_ID, 'backlog.generate', { 
        epic_count: epics.length 
    }, { 
        story_count: epics.reduce((sum, e) => sum + e.stories.length, 0) 
    });
    
    return { epics, summary };
}
