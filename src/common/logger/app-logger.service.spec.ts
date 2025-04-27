/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { AppLoggerService } from './app-logger.service';
import { ConfigService } from '../../config/config.service';
import { LogLevel } from '@nestjs/common';

describe('AppLoggerService', () => {
  let service: AppLoggerService;
  let configService: ConfigService;
  let originalEnv: NodeJS.ProcessEnv;
  let consoleSpy: jest.SpyInstance;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(async () => {
    // Reset environment
    process.env = { ...originalEnv };

    // Mock the console methods
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AppLoggerService,
          useFactory: (configService: ConfigService) => {
            return new AppLoggerService('TestContext', configService);
          },
          inject: [ConfigService],
        },
        {
          provide: ConfigService,
          useValue: {
            nodeEnv: 'development',
            logLevels: [
              'error',
              'warn',
              'log',
              'debug',
              'verbose',
            ] as LogLevel[],
          },
        },
      ],
    }).compile();

    service = module.get<AppLoggerService>(AppLoggerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('in development environment', () => {
    beforeEach(() => {
      // Ensure we're in development
      (configService as any).nodeEnv = 'development';
      (configService as any).logLevels = [
        'error',
        'warn',
        'log',
        'debug',
        'verbose',
      ] as LogLevel[];
    });

    it('should log messages at log level', () => {
      service.log('test message', 'context');
      expect(console.log).toHaveBeenCalled();
    });

    it('should log messages at error level', () => {
      service.error('error message', 'stack trace');
      expect(console.error).toHaveBeenCalled();
    });

    it('should log messages at warn level', () => {
      service.warn('warning message');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log messages at debug level', () => {
      service.debug('debug message');
      expect(console.debug).toHaveBeenCalled();
    });

    it('should log messages at verbose level', () => {
      service.verbose('verbose message');
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('in production environment', () => {
    beforeEach(async () => {
      // Reset environment and spies first
      process.env = { ...originalEnv };

      jest.clearAllMocks();

      // Create a new module with production config
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: AppLoggerService,
            useFactory: (configService: ConfigService) => {
              return new AppLoggerService('TestContext', configService);
            },
            inject: [ConfigService],
          },
          {
            provide: ConfigService,
            useValue: {
              nodeEnv: 'production',
              logLevels: ['error', 'warn'] as LogLevel[],
            },
          },
        ],
      }).compile();

      service = module.get<AppLoggerService>(AppLoggerService);
      configService = module.get<ConfigService>(ConfigService);
    });

    it('should not log messages at log level', () => {
      // Clear the spy to remove any initialization logs
      jest.clearAllMocks();

      service.log('test message', 'context');
      expect(console.log).not.toHaveBeenCalled();
    });

    it('should log messages at error level in production', () => {
      service.error('error message', 'stack trace');
      expect(console.error).toHaveBeenCalled();
    });

    it('should log messages at warn level in production', () => {
      service.warn('warning message');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should not log messages at debug level', () => {
      service.debug('debug message');
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should not log messages at verbose level', () => {
      service.verbose('verbose message');
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('setContext', () => {
    it('should set context and still log properly', () => {
      service.setContext('NewContext');

      // Test that logging still works after context change
      service.log('test after context change');
      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('fallback to process.env', () => {
    it('should use process.env if configService is not available', () => {
      // Create a service without config
      process.env.NODE_ENV = 'development';
      const standaloneService = new AppLoggerService('Test');
      jest.clearAllMocks();

      standaloneService.log('test message');
      expect(console.log).toHaveBeenCalled();

      // Switch to production
      process.env.NODE_ENV = 'production';
      const prodService = new AppLoggerService('Test');

      // Reset the spy
      jest.clearAllMocks();

      prodService.log('test message');
      expect(console.log).not.toHaveBeenCalled();

      // But errors should still be logged in production
      prodService.error('error in production');
      expect(console.error).toHaveBeenCalled();
    });
  });
});
