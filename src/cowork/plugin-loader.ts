/**
 * Cowork Plugin Loader
 * 
 * Loads and manages Cowork plugins from various sources including
 * bundled plugins, external plugins, and dynamically loaded modules.
 */

import * as fs from 'fs';
import * as path from 'path';
import { CoworkPlugin, CoworkPluginManifest } from './types';
import { logger } from '../runtime/logger';

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
 * @returns Path to system plugins directory (~/.config/opencode/cowork/plugins)
 */
export function getSystemPluginsDir(): string {
  return path.join(os.homedir(), '.config', 'opencode', 'cowork', 'plugins');
}

/**
 * Load native agents from opencode.json configuration
 * 
 * @returns Array of agent definitions from global config
 */
export function loadNativeAgents(): AgentDefinition[] {
  const configDir = path.join(os.homedir(), '.config', 'opencode');
  const configPath = path.join(configDir, 'opencode.json');
  
  const config = readJsonFile<{ agents: Record<string, any> }>(configPath);
  if (!config || !config.agents) {
    return [];
  }
  
  const agents: AgentDefinition[] = [];
  for (const [id, agentConfig] of Object.entries(config.agents)) {
    // Convert tool map to array
    const tools: string[] = [];
    if (agentConfig.tools) {
      for (const [toolName, enabled] of Object.entries(agentConfig.tools)) {
        if (enabled === true) tools.push(toolName);
      }
    }
    
    agents.push({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' ') + ' Agent',
      description: agentConfig.description || '',
      body: agentConfig.prompt || '',
      tools,
      model: agentConfig.model,
      color: 'blue'
    });
  }
  
  return agents;
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
 * Load all available plugins from the plugins directory
 */
export function loadAllPlugins(): CoworkPlugin[] {
  const plugins: CoworkPlugin[] = [];
  
  try {
    // Ensure plugins directory exists
    if (!fs.existsSync(PLUGINS_DIR)) {
      logger.debug('Plugins directory does not exist, creating...');
      fs.mkdirSync(PLUGINS_DIR, { recursive: true });
      return plugins;
    }
    
    // Scan plugins directory
    const entries = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const pluginPath = path.join(PLUGINS_DIR, entry.name);
        try {
          const plugin = loadPlugin(pluginPath);
          if (plugin) {
            plugins.push(plugin);
          }
        } catch (error) {
          logger.warn(`Failed to load plugin from ${pluginPath}:`, error);
        }
      }
    }
    
    logger.info(`Loaded ${plugins.length} plugin(s)`);
  } catch (error) {
    logger.error('Error loading plugins:', error);
  }
  
  return plugins;
}

/**
 * Load a single plugin from a directory
 */
export function loadPlugin(pluginPath: string): CoworkPlugin | null {
  const manifestPath = path.join(pluginPath, 'manifest.json');
  const indexPath = path.join(pluginPath, 'index.js');
  
  // Check for manifest.json
  if (!fs.existsSync(manifestPath)) {
    logger.debug(`No manifest.json found in ${pluginPath}`);
    return null;
  }
  
  try {
    // Load manifest
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifest: CoworkPluginManifest = JSON.parse(manifestContent);
    
    // Validate manifest
    if (!manifest.id || !manifest.name || !manifest.version) {
      logger.warn(`Invalid manifest in ${pluginPath}: missing required fields`);
      return null;
    }
    
    // Create plugin object
    const plugin: CoworkPlugin = {
      manifest,
      commands: [],
      agents: [],
      skills: [],
      hooks: [],
      rootPath: pluginPath,
    };
    
    // Try to load index.js if it exists
    if (fs.existsSync(indexPath)) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const pluginModule = require(indexPath);
        
        if (typeof pluginModule.init === 'function') {
          pluginModule.init(plugin);
        }
        
        // Extract commands, agents, skills, hooks if exported
        if (pluginModule.commands) {
          plugin.commands = pluginModule.commands;
        }
        if (pluginModule.agents) {
          plugin.agents = pluginModule.agents;
        }
        if (pluginModule.skills) {
          plugin.skills = pluginModule.skills;
        }
        if (pluginModule.hooks) {
          plugin.hooks = pluginModule.hooks;
        }
      } catch (error) {
        logger.warn(`Failed to load plugin module from ${indexPath}:`, error);
      }
    }
    
    logger.debug(`Loaded plugin: ${manifest.name} (${manifest.version})`);
    return plugin;
  } catch (error) {
    logger.warn(`Failed to parse manifest in ${pluginPath}:`, error);
    return null;
  }
}

/**
 * Discover plugins without loading them (returns manifests only)
 */
export function discoverPlugins(): CoworkPluginManifest[] {
  const manifests: CoworkPluginManifest[] = [];
  
  try {
    if (!fs.existsSync(PLUGINS_DIR)) {
      return manifests;
    }
    
    const entries = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const manifestPath = path.join(PLUGINS_DIR, entry.name, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
            const manifest: CoworkPluginManifest = JSON.parse(manifestContent);
            manifests.push(manifest);
          } catch {
            // Skip invalid manifests
          }
        }
      }
    }
  } catch (error) {
    logger.error('Error discovering plugins:', error);
  }
  
  return manifests;
}

/**
 * Register a plugin dynamically
 */
export function registerPlugin(plugin: CoworkPlugin): void {
  logger.info(`Registering plugin: ${plugin.manifest.name} (${plugin.manifest.version})`);
  // Plugin registration logic handled by registries
}
