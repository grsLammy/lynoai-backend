import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenPurchaseController } from './token-purchase.controller';
import { TokenPurchaseService } from './token-purchase.service';
import {
  TokenPurchase,
  TokenPurchaseSchema,
} from './schemas/token-purchase.schema';
import { ConfigModule } from '../config/config.module';

/**
 * Module for handling token purchases
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TokenPurchase.name, schema: TokenPurchaseSchema },
    ]),
    ConfigModule,
  ],
  controllers: [TokenPurchaseController],
  providers: [TokenPurchaseService],
  exports: [TokenPurchaseService],
})
export class TokenPurchaseModule {}
