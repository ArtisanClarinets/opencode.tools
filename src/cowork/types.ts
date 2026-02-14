/**
 * Cowork Plugin System - Type Definitions
 * 
 * Core type definitions for the plugin system that enables extensible
 * command and agent registration.
 */

export interface CoworkPluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  entryPoint?: string;
  capabilities?: string[];
}

export interface CoworkCommand {
  id: string;
  name: string;
  description: string;
  handler: (args: string[]) => Promise<CoworkCommandResult>;
  argumentHint?: string;
}

export interface CoworkCommandResult {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

export interface CoworkAgent {
  id: string;
  name: string;
  description: string;
  tools?: string[];
  model?: string;
  execute: (task: string, context?: unknown) => Promise<CoworkAgentResult>;
}

export interface CoworkAgentResult {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

export interface CoworkSkill {
  id: string;
  name: string;
  description: string;
  execute: (input: unknown) => Promise<unknown>;
}

export interface CoworkHook {
  event: string;
  handler: (context: unknown) => Promise<void>;
}

export interface CoworkPlugin {
  manifest: CoworkPluginManifest;
  commands: CoworkCommand[];
  agents: CoworkAgent[];
  skills: CoworkSkill[];
  hooks: CoworkHook[];
  rootPath?: string;
}

export interface RegistryEntry<T> {
  id: string;
  item: T;
  registeredAt: Date;
  source?: string;
}
