import * as fs from 'fs';
import * as path from 'path';

// Type for structured log entries
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  agentId?: string;
  data?: Record<string, any>;
}

const LOG_FILE_PATH = path.join(process.cwd(), 'opencode.log');

/**
 * Reusable structured logging utility. Writes JSON log entries to a file.
 */
export const logger = {
  log: (level: LogLevel, message: string, data: Record<string, any> = {}, agentId?: string): void => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      agentId,
      data,
    };
    const logLine = JSON.stringify(entry) + '\n';

    // In a real system, this would use a more robust logger like pino or winston
    // that handles non-blocking I/O. For simulation, we use synchronous write.
    try {
      fs.writeFileSync(LOG_FILE_PATH, logLine, { flag: 'a' });
    } catch (e) {
      console.error("Failed to write to log file: " + e);
    }
  },

  info: (message: string, data?: Record<string, any>, agentId?: string) => logger.log('info', message, data, agentId),
  warn: (message: string, data?: Record<string, any>, agentId?: string) => logger.log('warn', message, data, agentId),
  error: (message: string, data?: Record<string, any>, agentId?: string) => logger.log('error', message, data, agentId),
  debug: (message: string, data?: Record<string, any>, agentId?: string) => logger.log('debug', message, data, agentId),
};