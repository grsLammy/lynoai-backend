/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppLoggerService } from './common/logger/app-logger.service';

// Create a mock AppLoggerService for testing
const mockLoggerService = {
  log: jest.fn().mockImplementation(() => {}),
  error: jest.fn().mockImplementation(() => {}),
  warn: jest.fn().mockImplementation(() => {}),
  debug: jest.fn().mockImplementation(() => {}),
  verbose: jest.fn().mockImplementation(() => {}),
  setContext: jest.fn().mockImplementation(() => {}),
};

describe('AppController', () => {
  let appController: AppController;
  let loggerService: AppLoggerService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: AppLoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    loggerService = app.get<AppLoggerService>(AppLoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
      expect(loggerService.log).toHaveBeenCalledWith(
        'getHello endpoint was called',
      );
    });
  });

  describe('testLogger', () => {
    it('should return "Logger test completed"', () => {
      expect(appController.testLogger()).toBe('Logger test completed');
      expect(loggerService.log).toHaveBeenCalledWith(
        'testLogger endpoint was called',
      );
    });
  });
});
