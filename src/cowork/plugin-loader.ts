/**
 * Plugin Loader for Cowork Plugin System
 * 
 * Discovers and loads plugins from bundled and system directories.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  PluginManifest,
  PluginLoadResult,
  CommandDefinition,
  AgentDefinition,
  SkillDefinition,
  HookDefinition
} from './types';
import {
  parseCommandMarkdown,
  parseAgentMarkdown,
  parseSkillMarkdown
} from './markdown-parser';

/**
 * Get the bundled plugins directory path
 * 
 * @returns Path to bundled plugins directory
 */
export function getBundledPluginsDir(): string {
  // Get the project root (parent of dist or src)
  // When running from dist/src/cowork/, go up to project root
  const projectRoot = path.resolve(__dirname, '..', '..', '..');
  return path.join(projectRoot, 'src', 'cowork', 'plugins');
}

/**
 * Get the system plugins directory path
 * 
 * @returns Path to system plugins directory (~/.opencode/cowork/plugins)
 */
export function getSystemPluginsDir(): string {
  return path.join(os.homedir(), '.opencode', 'cowork', 'plugins');
}

/**
 * Check if a directory exists
 */
function directoryExists(dirPath: string): boolean {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Read and parse a JSON file
 */
function readJsonFile<T>(filePath: string): T | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Read a file safely
 */
function readFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Get all files matching a pattern in a directory
 */
function getFilesRecursive(dir: string, extension: string): string[] {
  const results: string[] = [];
  
  if (!directoryExists(dir)) {
    return results;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively search subdirectories
      const subResults = getFilesRecursive(fullPath, extension);
      results.push(...subResults);
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      results.push(fullPath);
    }
  }
  
  return results;
}

/**
 * Load hooks from a plugin's hooks directory
 */
function loadHooks(pluginRoot: string): HookDefinition[] {
  const hooksPath = path.join(pluginRoot, 'hooks', 'hooks.json');
  const hooksData = readJsonFile<HookDefinition[]>(hooksPath);
  
  if (!hooksData) {
    return [];
  }
  
  // Validate hook structure
  return hooksData.filter(hook => {
    return hook.name && hook.events && hook.command;
  });
}

/**
 * Load commands from a plugin's commands directory
 */
function loadCommands(pluginRoot: string): CommandDefinition[] {
  const commandsDir = path.join(pluginRoot, 'commands');
  
  if (!directoryExists(commandsDir)) {
    return [];
  }
  
  const commandFiles = getFilesRecursive(commandsDir, '.md');
  const commands: CommandDefinition[] = [];
  
  for (const filePath of commandFiles) {
    const content = readFile(filePath);
    if (!content) continue;
    
    // Get relative path and derive ID
    const relativePath = path.relative(commandsDir, filePath);
    const id = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');
    
    try {
      const command = parseCommandMarkdown(content, id);
      commands.push(command);
    } catch (error) {
      // Log but continue loading other commands
      console.warn(`Failed to load command "${id}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return commands;
}

/**
 * Load agents from a plugin's agents directory
 */
function loadAgents(pluginRoot: string): AgentDefinition[] {
  const agentsDir = path.join(pluginRoot, 'agents');
  
  if (!directoryExists(agentsDir)) {
    return [];
  }
  
  const agentFiles = getFilesRecursive(agentsDir, '.md');
  const agents: AgentDefinition[] = [];
  
  for (const filePath of agentFiles) {
    const content = readFile(filePath);
    if (!content) continue;
    
    // Get relative path and derive ID
    const relativePath = path.relative(agentsDir, filePath);
    const id = relativePath.replace(/\.md$/, '').replace(/\\/g, '/');
    
    try {
      const agent = parseAgentMarkdown(content, id);
      agents.push(agent);
    } catch (error) {
      // Log but continue loading other agents
      console.warn(`Failed to load agent "${id}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return agents;
}

/**
 * Load skills from a plugin's skills directory
 */
function loadSkills(pluginRoot: string): SkillDefinition[] {
  const skillsDir = path.join(pluginRoot, 'skills');
  
  if (!directoryExists(skillsDir)) {
    return [];
  }
  
  // Look for SKILL.md files
  const skillFiles = getFilesRecursive(skillsDir, 'SKILL.md');
  const skills: SkillDefinition[] = [];
  
  for (const filePath of skillFiles) {
    const content = readFile(filePath);
    if (!content) continue;
    
    // Get relative path and derive ID
    const relativePath = path.relative(skillsDir, filePath);
    const id = relativePath.replace(/\\/g, '/').replace(/\/SKILL\.md$/, '');
    
    try {
      const skill = parseSkillMarkdown(content, id);
      skills.push(skill);
    } catch (error) {
      // Log but continue loading other skills
      console.warn(`Failed to load skill "${id}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return skills;
}

/**
 * Load a single plugin from directory
 * 
 * @param pluginPath - Path to plugin directory
 * @returns Loaded plugin result
 * @throws Error if plugin manifest is invalid
 */
export function loadPlugin(pluginPath: string): PluginLoadResult {
  const manifestPath = path.join(pluginPath, 'plugin.json');
  
  // Read and validate manifest
  const manifest = readJsonFile<PluginManifest>(manifestPath);
  
  if (!manifest) {
    throw new Error(`Plugin at "${pluginPath}" has no valid plugin.json`);
  }
  
  if (!manifest.id || !manifest.name || !manifest.version) {
    throw new Error(`Plugin at "${pluginPath}" is missing required manifest fields (id, name, version)`);
  }
  
  // Load components
  const commands = loadCommands(pluginPath);
  const agents = loadAgents(pluginPath);
  const skills = loadSkills(pluginPath);
  const hooks = loadHooks(pluginPath);
  
  return {
    manifest,
    commands,
    agents,
    skills,
    hooks,
    rootPath: pluginPath
  };
}

/**
 * Discover and load all plugins
 * 
 * @returns Array of loaded plugins
 */
export function loadAllPlugins(): PluginLoadResult[] {
  const plugins: PluginLoadResult[] = [];
  
  // Load bundled plugins first
  const bundledDir = getBundledPluginsDir();
  if (directoryExists(bundledDir)) {
    const entries = fs.readdirSync(bundledDir, { withFileTypes: true });
    
    // Sort alphabetically for deterministic loading
    const sortedEntries = entries.sort((a, b) => a.name.localeCompare(b.name));
    
    for (const entry of sortedEntries) {
      if (entry.isDirectory()) {
        const pluginPath = path.join(bundledDir, entry.name);
        try {
          const plugin = loadPlugin(pluginPath);
          plugins.push(plugin);
        } catch (error) {
          console.warn(`Failed to load bundled plugin "${entry.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
  }
  
  // Load system plugins second
  const systemDir = getSystemPluginsDir();
  if (directoryExists(systemDir)) {
    const entries = fs.readdirSync(systemDir, { withFileTypes: true });
    
    // Sort alphabetically for deterministic loading
    const sortedEntries = entries.sort((a, b) => a.name.localeCompare(b.name));
    
    for (const entry of sortedEntries) {
      if (entry.isDirectory()) {
        const pluginPath = path.join(systemDir, entry.name);
        try {
          const plugin = loadPlugin(pluginPath);
          // Override bundled plugins with same ID
          const existingIndex = plugins.findIndex(p => p.manifest.id === plugin.manifest.id);
          if (existingIndex >= 0) {
            plugins[existingIndex] = plugin;
          } else {
            plugins.push(plugin);
          }
        } catch (error) {
          console.warn(`Failed to load system plugin "${entry.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }
  }
  
  return plugins;
}
