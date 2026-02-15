/**
 * Command Registry
 * 
 * Central registry for managing and executing Cowork commands.
 * Provides singleton pattern for global command access.
 */

import { CoworkCommand, CoworkCommandResult, RegistryEntry } from '../types';
import { logger } from '../../runtime/logger';

export class CommandRegistry {
  private static instance: CommandRegistry;
  private commands: Map<string, RegistryEntry<CoworkCommand>>;
  
  private constructor() {
    this.commands = new Map();
  }
  
  /**
   * Get the singleton instance of CommandRegistry
   */
  public static getInstance(): CommandRegistry {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry();
    }
    return CommandRegistry.instance;
  }
  
  /**
   * Register a single command
   */
  public register(command: CoworkCommand, source?: string): void {
    if (this.commands.has(command.id)) {
      logger.warn(`Command with id '${command.id}' already registered, overwriting`);
    }
    
    this.commands.set(command.id, {
      id: command.id,
      item: command,
      registeredAt: new Date(),
      source,
    });
    
    logger.debug(`Registered command: ${command.name} (${command.id})`);
  }
  
  /**
   * Register multiple commands
   */
  public registerMany(commands: CoworkCommand[], source?: string): void {
    for (const command of commands) {
      this.register(command, source);
    }
  }
  
  /**
   * Unregister a command by id
   */
  public unregister(commandId: string): boolean {
    const deleted = this.commands.delete(commandId);
    if (deleted) {
      logger.debug(`Unregistered command: ${commandId}`);
    }
    return deleted;
  }
  
  /**
   * Get a command by id
   */
  public get(commandId: string): CoworkCommand | undefined {
    const entry = this.commands.get(commandId);
    return entry?.item;
  }

  /**
   * Get a command by name (or ID)
   */
  public getByName(name: string): CoworkCommand | undefined {
    // Try getting by ID first
    const byId = this.get(name);
    if (byId) return byId;

    // Search by name property
    return Array.from(this.commands.values()).find(entry => entry.item.name === name)?.item;
  }
  
  /**
   * Check if a command exists
   */
  public has(commandId: string): boolean {
    return this.commands.has(commandId);
  }
  
  /**
   * Execute a command by id with the given arguments
   */
  public async execute(commandId: string, args: string[] = []): Promise<CoworkCommandResult> {
    const command = this.get(commandId);
    
    if (!command) {
      return {
        success: false,
        error: `Command '${commandId}' not found`,
      };
    }
    
    try {
      logger.debug(`Executing command: ${command.name}`, { args });
      const result = await command.handler(args);
      logger.debug(`Command executed successfully: ${command.name}`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Command execution failed: ${command.name}`, error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }
  
  /**
   * List all registered commands
   */
  public list(): CoworkCommand[] {
    return Array.from(this.commands.values()).map(entry => entry.item);
  }
  
  /**
   * Get all registered command ids
   */
  public getIds(): string[] {
    return Array.from(this.commands.keys());
  }
  
  /**
   * Clear all registered commands
   */
  public clear(): void {
    this.commands.clear();
    logger.debug('Cleared all commands from registry');
  }
  
  /**
   * Get the count of registered commands
   */
  public count(): number {
    return this.commands.size;
  }
}
