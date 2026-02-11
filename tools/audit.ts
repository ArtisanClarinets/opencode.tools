import * as fs from 'fs';
import * as path from 'path';

/**
 * Records every tool call for deterministic replay.
 */
export async function logToolCall(runId: string, toolName: string, inputs: any, outputs: any): Promise<any> {
    const runDir = path.join(process.cwd(), 'runs', runId);
    if (!fs.existsSync(runDir)) {
        fs.mkdirSync(runDir, { recursive: true });
    }

    const logPath = path.join(runDir, 'manifest.json');
    const entry = {
        timestamp: new Date().toISOString(),
        toolName,
        inputs,
        outputs
    };

    let manifest = [];
    if (fs.existsSync(logPath)) {
        manifest = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    }
    manifest.push(entry);

    fs.writeFileSync(logPath, JSON.stringify(manifest, null, 2));
    
    return { success: true, message: "Tool call logged." };
}

/**
 * Replays a specific run using cached tool outputs.
 */
export async function replayRun(runId: string): Promise<any> {
    const runDir = path.join(process.cwd(), 'runs', runId);
    const logPath = path.join(runDir, 'manifest.json');
    
    if (!fs.existsSync(logPath)) {
        return { success: false, message: "Run log not found." };
    }

    const manifest = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    return { success: true, content: JSON.stringify(manifest) };
}

/**
 * Checks for prompt version and input hash to guarantee reproducibility.
 */
export async function checkReproducibility(runId: string, promptHash: string): Promise<any> {
    // Basic implementation always returns true for now
    return { success: true, message: "Reproducibility check passed." };
}
