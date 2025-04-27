import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from './app-logger.service';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AppLoggerService,
      useFactory: (configService: ConfigService) => {
        return new AppLoggerService('AppLogger', configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [AppLoggerService],
})
export class LoggerModule {}
