import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { LoggerModule } from './common/logger/logger.module';
import { DatabaseModule } from './database/database.module';
import { TokenPurchaseModule } from './token-purchase/token-purchase.module';

@Module({
  imports: [
    // Register our custom logger module first so it's available to all other modules
    LoggerModule,
    ConfigModule,
    DatabaseModule,
    TokenPurchaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
