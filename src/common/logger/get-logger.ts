import { AppLoggerService } from './app-logger.service';

/**
 * Creates a logger instance with the given context name.
 * This is a convenient way to get a logger without needing to inject it.
 *
 * Usage examples:
 * ```
 * const logger = getLogger('MyService');
 * logger.log('Hello world');
 * ```
 *
 * @param context The name of the class or context for the logger
 * @returns A configured AppLoggerService instance
 */
export function getLogger(context: string): AppLoggerService {
  return new AppLoggerService(context);
}
