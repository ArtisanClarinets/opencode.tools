import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * OpenCode Native Integration Script
 * 
 * This script ensures OpenCode Tools are integrated directly into the
 * global OpenCode TUI by deploying configuration to standard locations.
 */

async function main() {
    console.log('🚀 Integrating OpenCode Tools natively...');

    const homeDir = os.homedir();
    const currentProjectDir = process.cwd().replace(/\\/g, '/');
    const opencodeJsonPath = path.join(currentProjectDir, 'opencode.json');
    const globalOpencodeJsonPath = path.join(homeDir, 'opencode.json');
    const agentsDir = path.join(homeDir, '.agents');

    // 1. Load the project configuration
    if (!fs.existsSync(opencodeJsonPath)) {
        console.error('❌ Error: opencode.json not found in project root.');
        process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(opencodeJsonPath, 'utf-8'));

    // 2. Fix the MCP server path to be absolute to this installation
    const fixPath = (cmd: string[]) => cmd.map(arg => arg.replace('{project_root}', currentProjectDir));

    if (config.mcp['opencode-tools']) {
        config.mcp['opencode-tools'].command = fixPath(config.mcp['opencode-tools'].command);
    }
    if (config.mcp['discovery.session.export']) {
        config.mcp['discovery.session.export'].command = fixPath(config.mcp['discovery.session.export'].command);
    }

    // 3. Deploy to ~/opencode.json (Global Config)
    console.log(`📝 Deploying global config to ${globalOpencodeJsonPath}...`);
    fs.writeFileSync(globalOpencodeJsonPath, JSON.stringify(config, null, 2));

    // 4. Deploy to ~/.agents/ (Additional Tools/Skills)
    if (!fs.existsSync(agentsDir)) {
        console.log(`📁 Creating agents directory: ${agentsDir}...`);
        fs.mkdirSync(agentsDir, { recursive: true });
    }

    console.log(`📦 Deploying agent definitions to ${agentsDir}...`);
    for (const [agentId, agentConfig] of Object.entries(config.agent)) {
        const agentFile = path.join(agentsDir, `${agentId}.json`);
        const wrappedAgent = {
            agent: {
                [agentId]: agentConfig
            }
        };
        fs.writeFileSync(agentFile, JSON.stringify(wrappedAgent, null, 2));
        console.log(`   ✅ ${agentId} deployed.`);
    }

    // 5. Deploy MCP skills to ~/.agents/skills (if supported)
    const skillsDir = path.join(agentsDir, 'skills');
    if (!fs.existsSync(skillsDir)) {
        fs.mkdirSync(skillsDir, { recursive: true });
    }
    fs.copyFileSync(opencodeJsonPath, path.join(skillsDir, 'opencode-tools.json'));

    console.log('\n✅ Native integration complete!');
    console.log('✨ You can now use these agents directly in your native OpenCode TUI:');
    Object.keys(config.agent).forEach(id => console.log(`   - opencode --agent ${id}`));
}

main().catch(err => {
    console.error('❌ Integration failed:', err);
    process.exit(1);
});
