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

const PLUGINS_DIR = path.join(process.cwd(), 'plugins');

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
