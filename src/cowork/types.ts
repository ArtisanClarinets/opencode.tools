/**
 * Cowork Plugin System - Core Type Definitions
 * 
 * Defines all types for the plugin system including commands, agents,
 * skills, hooks, and permission structures.
 */

/**
 * Plugin manifest containing metadata about a plugin
 */
export interface PluginManifest {
  /** Unique identifier for the plugin */
  id: string;
  /** Human-readable name */
  name: string;
  /** Semantic version */
  version: string;
  /** Optional description */
  description?: string;
  /** Plugin author */
  author?: string;
  /** License type */
  license?: string;
  /** Entry point configuration */
  entryPoint?: {
    type: 'command' | 'agent' | 'hook';
    path: string;
  };
  /** Plugin capabilities */
  capabilities?: string[];
}

/**
 * Command definition from markdown frontmatter
 */
export interface CommandDefinition {
  /** Unique identifier */
  id: string;
  /** Command name (used in CLI) */
  name: string;
  /** Human-readable description */
  description: string;
  /** Command body/prompt content */
  body: string;
  /** Allowed tools for this command */
  allowedTools?: string[];
  /** Model to use for this command */
  model?: string;
  /** Hint for command arguments */
  argumentHint?: string;
}

/**
 * Agent definition from markdown frontmatter
 */
export interface AgentDefinition {
  /** Unique identifier */
  id: string;
  /** Agent name */
  name: string;
  /** Human-readable description */
  description: string;
  /** Agent body/prompt content */
  body: string;
  /** Tools available to this agent */
  tools?: string[];
  /** Model to use for this agent */
  model?: string;
  /** Display color for the agent */
  color?: string;
}

/**
 * Skill definition from markdown
 */
export interface SkillDefinition {
  /** Unique identifier */
  id: string;
  /** Skill name */
  name: string;
  /** Skill body/content */
  body: string;
}

/**
 * Hook event types that can trigger hooks
 */
export type HookEvent = 
  | 'SessionStart'
  | 'UserPromptSubmit'
  | 'PreToolUse'
  | 'PostToolUse'
  | 'Stop'
  | 'SessionEnd';

/**
 * Hook definition for event-driven scripting
 */
export interface HookDefinition {
  /** Hook name */
  name: string;
  /** Events this hook responds to */
  events: HookEvent[];
  /** Hook type */
  type: 'command';
  /** Command to execute */
  command: string;
  /** Timeout in milliseconds */
  timeoutMs?: number;
}

/**
 * Context passed to hooks when triggered
 */
export interface HookContext {
  /** Event name that triggered the hook */
  eventName: HookEvent;
  /** Tool name if applicable */
  toolName?: string;
  /** Tool input data if applicable */
  toolInput?: Record<string, unknown>;
  /** Project directory */
  projectDir: string;
  /** Plugin root directory */
  pluginRoot: string;
  /** Path to transcript file */
  transcriptPath?: string;
  /** Timestamp of the event */
  timestamp: string;
}

/**
 * Decision returned by hook execution
 */
export interface HookDecision {
  /** Decision outcome */
  decision: 'allow' | 'deny' | 'block';
  /** Optional message explaining the decision */
  message?: string;
}

/**
 * Result of loading a complete plugin
 */
export interface PluginLoadResult {
  /** Plugin manifest */
  manifest: PluginManifest;
  /** Loaded commands */
  commands: CommandDefinition[];
  /** Loaded agents */
  agents: AgentDefinition[];
  /** Loaded skills */
  skills: SkillDefinition[];
  /** Loaded hooks */
  hooks: HookDefinition[];
  /** Root path of the plugin */
  rootPath: string;
}

/**
 * Tool permission configuration
 */
export interface ToolPermission {
  /** Tool name */
  toolName: string;
  /** Whether tool is allowed */
  allowed: boolean;
}
