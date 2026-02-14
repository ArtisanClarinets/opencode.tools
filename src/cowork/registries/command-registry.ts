/**
 * Command Registry for Cowork Plugin System
 * 
 * Singleton registry for registering and looking up commands.
 */

import { CommandDefinition } from '../types';

/**
 * Command Registry
 * Singleton for registering and looking up commands
 */
export class CommandRegistry {
  private static instance: CommandRegistry;
  private commands: Map<string, CommandDefinition>;
  private nameIndex: Map<string, string>;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.commands = new Map<string, CommandDefinition>();
    this.nameIndex = new Map<string, string>();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): CommandRegistry {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry();
    }
    return CommandRegistry.instance;
  }

  /**
   * Register a command
   * If a command with the same ID exists, it will be overridden
   * 
   * @param command - Command definition to register
   */
  public register(command: CommandDefinition): void {
    // Store by ID
    this.commands.set(command.id, command);
    
    // Index by lowercase name for case-insensitive lookup
    const nameKey = command.name.toLowerCase();
    this.nameIndex.set(nameKey, command.id);
  }

  /**
   * Register multiple commands at once
   * 
   * @param commands - Array of command definitions
   */
  public registerMany(commands: CommandDefinition[]): void {
    for (const command of commands) {
      this.register(command);
    }
  }

  /**
   * Get command by ID
   * 
   * @param id - Command ID
   * @returns Command definition or undefined if not found
   */
  public get(id: string): CommandDefinition | undefined {
    return this.commands.get(id);
  }

  /**
   * Get command by name (case-insensitive)
   * 
   * @param name - Command name
   * @returns Command definition or undefined if not found
   */
  public getByName(name: string): CommandDefinition | undefined {
    const nameKey = name.toLowerCase();
    const id = this.nameIndex.get(nameKey);
    
    if (!id) {
      return undefined;
    }
    
    return this.commands.get(id);
  }

  /**
   * List all registered commands
   * 
   * @returns Array of all command definitions
   */
  public list(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  /**
   * Check if command exists
   * 
   * @param id - Command ID
   * @returns True if command exists
   */
  public has(id: string): boolean {
    return this.commands.has(id);
  }

  /**
   * Clear all registered commands
   * Useful for testing
   */
  public clear(): void {
    this.commands.clear();
    this.nameIndex.clear();
  }

  /**
   * Get the number of registered commands
   */
  public size(): number {
    return this.commands.size;
  }
}
