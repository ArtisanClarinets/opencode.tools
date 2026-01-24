export interface ArchComponent {
    name: string;
    description: string;
    interfaces: string[];
}
/**
 * E1: Architecture Agent (real)
 * Generates structured architecture artifacts.
 */
export declare function generateArchitecture(prd: any, constraints: any[]): Promise<{
    systemContext: string;
    components: ArchComponent[];
    dataModel: string;
    securityModel: any;
}>;
/**
 * E2: Backlog generator
 * Converts architecture and requirements into a structured backlog.
 */
export declare function generateBacklog(architecture: any): Promise<{
    epics: any[];
}>;
//# sourceMappingURL=architecture.d.ts.map