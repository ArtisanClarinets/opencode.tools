"use strict";
// C:\Users\drpt0\iCloudDrive\Developer\Projects\Active\opencode.tools\agents\research\index.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.gatherDossier = gatherDossier;
const fs = __importStar(require("fs"));
const research_agent_1 = require("./research-agent");
/**
 * Orchestrates research using the ResearchAgent.
 * @param briefPathOrJson The client brief as a JSON string or path to a JSON file.
 * @returns A structured Research Output.
 */
async function gatherDossier(briefPathOrJson) {
    let input;
    try {
        // Check if input is a file path
        if (fs.existsSync(briefPathOrJson) && fs.lstatSync(briefPathOrJson).isFile()) {
            const content = fs.readFileSync(briefPathOrJson, 'utf-8');
            // If the file contains the full ResearchInput structure
            const parsed = JSON.parse(content);
            if (parsed.brief) {
                input = parsed;
            }
            else {
                // If the file is just the ClientBrief
                input = { brief: parsed };
            }
        }
        else {
            // Try parsing as JSON string
            const parsed = JSON.parse(briefPathOrJson);
            if (parsed.brief) {
                input = parsed;
            }
            else {
                input = { brief: parsed };
            }
        }
    }
    catch (error) {
        console.error("Failed to parse input brief:", error);
        throw new Error("Invalid input: Must be a valid JSON string or path to a JSON file containing a ClientBrief.");
    }
    const agent = new research_agent_1.ResearchAgent();
    console.log(`Starting research for ${input.brief.company}...`);
    return await agent.execute(input);
}
// CLI Entry Point removed to enforce TUI-only access
//# sourceMappingURL=index.js.map