import { ToolCallRecord } from '../types/run';
export declare class AuditLogger {
    private logPath;
    constructor(runDir: string);
    log(record: ToolCallRecord): Promise<void>;
    readAll(): Promise<ToolCallRecord[]>;
}
//# sourceMappingURL=audit.d.ts.map