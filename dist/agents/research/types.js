"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchInputSchema = exports.ClientBriefSchema = void 0;
const zod_1 = require("zod");
exports.ClientBriefSchema = zod_1.z.object({
    company: zod_1.z.string().min(1, "Company name is required"),
    industry: zod_1.z.string().min(1, "Industry is required"),
    description: zod_1.z.string().min(1, "Description is required"),
    goals: zod_1.z.array(zod_1.z.string()).min(1, "At least one goal is required"),
    constraints: zod_1.z.array(zod_1.z.string()).optional(),
    timeline: zod_1.z.string().optional()
});
exports.ResearchInputSchema = zod_1.z.object({
    brief: exports.ClientBriefSchema,
    keywords: zod_1.z.array(zod_1.z.string()).optional(),
    urls: zod_1.z.array(zod_1.z.string().url()).optional(),
    priorNotes: zod_1.z.string().optional()
});
//# sourceMappingURL=types.js.map