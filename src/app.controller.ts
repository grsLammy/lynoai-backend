import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AppLoggerService } from './common/logger/app-logger.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly logger: AppLoggerService,
  ) {}

  @Get()
  getHello(): string {
    this.logger.log('getHello endpoint was called');
    this.logger.debug('This is a debug message');
    this.logger.warn('This is a warning');
    this.logger.error('This is an error');
    this.logger.verbose('This is a verbose message');
    return this.appService.getHello();
  }

  @Get('test-logger')
  testLogger(): string {
    this.logger.log('testLogger endpoint was called');
    this.logger.debug('This is a debug message from testLogger');
    this.logger.warn('This is a warning from testLogger');
    this.logger.error('This is an error from testLogger');
    this.logger.verbose('This is a verbose message from testLogger');
    return 'Logger test completed';
  }
}
