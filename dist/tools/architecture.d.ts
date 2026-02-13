import { ProjectStack } from './discovery';
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
 * Generate architecture document
 */
export declare function generateArchitecture(prd: any, constraints?: any[]): Promise<{
    systemContext: string;
    components: ArchComponent[];
    dataModel: DataModel;
    securityModel: SecurityModel;
    mermaid: string;
    summary: string;
}>;
/**
 * Generate backlog from architecture
 */
export declare function generateBacklog(architecture: any): Promise<{
    epics: any[];
    summary: string;
}>;
//# sourceMappingURL=architecture.d.ts.map