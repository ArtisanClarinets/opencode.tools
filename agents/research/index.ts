// C:\Users\drpt0\iCloudDrive\Developer\Projects\Active\opencode.tools\agents\research\index.ts

import * as fs from 'fs';
import { ResearchAgent } from './research-agent';
import { ResearchInput, ResearchOutput } from './types';

// Kept for backward compatibility if needed, but gatherDossier now returns ResearchOutput
export interface Dossier {
    summary: string;
    competitors: string[];
    constraints: string[];
    opportunities: string[];
    rawSources: string[];
    markdown: string;
}

/**
 * Orchestrates research using the ResearchAgent.
 * @param briefPathOrJson The client brief as a JSON string or path to a JSON file.
 * @returns A structured Research Output.
 */
export async function gatherDossier(briefPathOrJson: string): Promise<ResearchOutput> {
    let input: ResearchInput;

    try {
        // Check if input is a file path
        if (fs.existsSync(briefPathOrJson) && fs.lstatSync(briefPathOrJson).isFile()) {
            const content = fs.readFileSync(briefPathOrJson, 'utf-8');
            // If the file contains the full ResearchInput structure
            const parsed = JSON.parse(content);
            if (parsed.brief) {
                input = parsed;
            } else {
                // If the file is just the ClientBrief
                input = { brief: parsed };
            }
        } else {
            // Try parsing as JSON string
            const parsed = JSON.parse(briefPathOrJson);
            if (parsed.brief) {
                input = parsed;
            } else {
                input = { brief: parsed };
            }
        }
    } catch (error) {
        console.error("Failed to parse input brief:", error);
        throw new Error("Invalid input: Must be a valid JSON string or path to a JSON file containing a ClientBrief.");
    }

    const agent = new ResearchAgent();
    console.log(`Starting research for ${input.brief.company}...`);
    return await agent.execute(input);
}

// CLI Entry Point removed to enforce TUI-only access
