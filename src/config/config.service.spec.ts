import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { LogLevel } from '@nestjs/common';

describe('ConfigService', () => {
  let service: ConfigService;
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    process.env = {};
  });

  describe('basic initialization', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [ConfigService],
      }).compile();

      service = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should return default port when PORT is not set', () => {
      expect(service.port).toBe(3001);
    });

    it('should return custom port when PORT is set', () => {
      process.env.PORT = '4000';
      expect(service.port).toBe(4000);
    });

    it('should return default nodeEnv as development when NODE_ENV is not set', () => {
      expect(service.nodeEnv).toBe('development');
    });

    it('should return the correct nodeEnv when NODE_ENV is set', () => {
      process.env.NODE_ENV = 'production';
      expect(service.nodeEnv).toBe('production');

      process.env.NODE_ENV = 'test';
      expect(service.nodeEnv).toBe('test');
    });

    it('should return default logLevels when LOG_LEVEL is not set', () => {
      const expected: LogLevel[] = ['error', 'warn', 'log'];
      expect(service.logLevels).toEqual(expected);
    });

    it('should return correct logLevels for each LOG_LEVEL value', () => {
      // Test each possible log level
      process.env.LOG_LEVEL = 'error';
      expect(service.logLevels).toEqual(['error']);

      process.env.LOG_LEVEL = 'warn';
      expect(service.logLevels).toEqual(['error', 'warn']);

      process.env.LOG_LEVEL = 'log';
      expect(service.logLevels).toEqual(['error', 'warn', 'log']);

      process.env.LOG_LEVEL = 'debug';
      expect(service.logLevels).toEqual(['error', 'warn', 'log', 'debug']);

      process.env.LOG_LEVEL = 'verbose';
      expect(service.logLevels).toEqual([
        'error',
        'warn',
        'log',
        'debug',
        'verbose',
      ]);

      // Test fallback for invalid value
      process.env.LOG_LEVEL = 'invalid';
      expect(service.logLevels).toEqual(['error', 'warn', 'log']);
    });
  });

  describe('MongoDB configuration', () => {
    it('should throw error when MONGODB_URI is missing', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [ConfigService],
      }).compile();

      service = module.get<ConfigService>(ConfigService);

      expect(() => service.mongodbUri).toThrow(
        'Missing required environment variable: MONGODB_URI',
      );
    });

    it('should return the correct MongoDB URI when MONGODB_URI is set', async () => {
      process.env.MONGODB_URI = 'mongodb://localhost:27017/lynoai';

      const module: TestingModule = await Test.createTestingModule({
        providers: [ConfigService],
      }).compile();

      service = module.get<ConfigService>(ConfigService);

      expect(service.mongodbUri).toBe('mongodb://localhost:27017/lynoai');
    });
  });
});
