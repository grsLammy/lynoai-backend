import { Injectable, LoggerService, Scope, LogLevel } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';

/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Custom logger service that controls logging based on the environment and configured log levels
 * Uses ConfigService to determine which log levels are enabled
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
  private readonly isProduction: boolean;
  private readonly allowedLevels: LogLevel[];
  private context: string;

  constructor(
    context?: string,
    private readonly configService?: ConfigService,
  ) {
    this.context = context || 'AppLogger';

    // Use ConfigService if available, otherwise fallback to process.env
    this.isProduction = this.configService
      ? this.configService.nodeEnv === 'production'
      : process.env.NODE_ENV === 'production';

    // Get allowed log levels from config if available, otherwise use reasonable defaults
    if (this.configService && this.configService.logLevels) {
      this.allowedLevels = this.configService.logLevels;
    } else {
      // In production, only log errors and warnings by default
      // In development, log everything by default
      this.allowedLevels = this.isProduction
        ? (['error', 'warn'] as LogLevel[])
        : (['error', 'warn', 'log', 'debug', 'verbose'] as LogLevel[]);
    }
  }

  /**
   * Set the context for this logger instance
   */
  setContext(context: string) {
    this.context = context;
  }

  /**
   * Format a log message with timestamp and context
   */
  private formatMessage(message: any, level: LogLevel): string {
    const timestamp = new Date().toISOString();
    let formattedLevel = '';

    // Add color based on log level
    switch (level) {
      case 'error':
        formattedLevel = `${colors.red}ERROR${colors.reset}`;
        break;
      case 'warn':
        formattedLevel = `${colors.yellow}WARN${colors.reset}`;
        break;
      case 'debug':
        formattedLevel = `${colors.blue}DEBUG${colors.reset}`;
        break;
      case 'verbose':
        formattedLevel = `${colors.gray}VERBOSE${colors.reset}`;
        break;
      default:
        formattedLevel = `${colors.green}INFO${colors.reset}`;
    }

    return `${timestamp} ${formattedLevel} ${colors.cyan}[${this.context}]${colors.reset} ${message}`;
  }

  /**
   * Check if a log level is allowed in the current environment
   */
  private isLevelAllowed(level: LogLevel): boolean {
    return this.allowedLevels.includes(level);
  }

  /**
   * Log a message at the 'log' level
   */
  log(message: any, ...optionalParams: any[]) {
    if (this.isLevelAllowed('log')) {
      console.log(this.formatMessage(message, 'log'), ...optionalParams);
    }
  }

  /**
   * Log a message at the 'error' level
   */
  error(message: any, ...optionalParams: any[]) {
    if (this.isLevelAllowed('error')) {
      console.error(this.formatMessage(message, 'error'), ...optionalParams);
    }
  }

  /**
   * Log a message at the 'warn' level
   */
  warn(message: any, ...optionalParams: any[]) {
    if (this.isLevelAllowed('warn')) {
      console.warn(this.formatMessage(message, 'warn'), ...optionalParams);
    }
  }

  /**
   * Log a message at the 'debug' level
   */
  debug(message: any, ...optionalParams: any[]) {
    if (this.isLevelAllowed('debug')) {
      console.debug(this.formatMessage(message, 'debug'), ...optionalParams);
    }
  }

  /**
   * Log a message at the 'verbose' level
   */
  verbose(message: any, ...optionalParams: any[]) {
    if (this.isLevelAllowed('verbose')) {
      console.log(this.formatMessage(message, 'verbose'), ...optionalParams);
    }
  }
}
