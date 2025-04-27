import {
  Injectable,
  InternalServerErrorException,
  LogLevel,
} from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class ConfigService {
  private get(key: string, required = false): string | undefined {
    const value = process.env[key];
    if (required && !value) {
      throw new InternalServerErrorException(
        `Missing required environment variable: ${key}`,
      );
    }
    return value;
  }

  /**
   * Get the current node environment (development, production, test)
   */
  get nodeEnv(): string {
    return this.get('NODE_ENV') || 'development';
  }

  /**
   * Get the log level for the application
   * Returns array of log levels to enable based on the LOG_LEVEL environment variable
   * Default is ['error', 'warn', 'log'] if not specified
   */
  get logLevels(): LogLevel[] {
    const logLevel = this.get('LOG_LEVEL') || 'log';

    switch (logLevel) {
      case 'error':
        return ['error'];
      case 'warn':
        return ['error', 'warn'];
      case 'log':
        return ['error', 'warn', 'log'];
      case 'debug':
        return ['error', 'warn', 'log', 'debug'];
      case 'verbose':
        return ['error', 'warn', 'log', 'debug', 'verbose'];
      default:
        return ['error', 'warn', 'log'];
    }
  }

  get port(): number {
    return Number(this.get('PORT')) || 3001;
  }

  /**
   * Get the MongoDB connection URI
   */
  get mongodbUri(): string {
    return this.get('MONGODB_URI', true)!;
  }
}
