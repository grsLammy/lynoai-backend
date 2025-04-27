/* eslint-disable */

import { getLogger } from './get-logger';
import { AppLoggerService } from './app-logger.service';

describe('getLogger', () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an AppLoggerService instance', () => {
    const logger = getLogger('TestContext');
    expect(logger).toBeInstanceOf(AppLoggerService);
  });

  it('should create a logger with the provided context', () => {
    const logger = getLogger('MyCustomContext');

    // Call the log method
    logger.log('Test message');

    // Verify console.log was called
    expect(consoleLogSpy).toHaveBeenCalled();

    // Check that the context is included in the message
    const callArg = consoleLogSpy.mock.calls[0][0];
    expect(callArg).toContain('[MyCustomContext]');
  });
});
