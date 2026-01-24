"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolCallSchema = void 0;
const zod_1 = require("zod");
exports.ToolCallSchema = zod_1.z.object({
    id: zod_1.z.string(),
    toolId: zod_1.z.string(),
    args: zod_1.z.any(),
    timestamp: zod_1.z.string(),
    durationMs: zod_1.z.number(),
    success: zod_1.z.boolean(),
    output: zod_1.z.any().optional(),
    error: zod_1.z.any().optional(),
    outputHash: zod_1.z.string().optional()
});
//# sourceMappingURL=run.js.map