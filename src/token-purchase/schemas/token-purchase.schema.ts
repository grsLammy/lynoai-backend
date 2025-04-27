import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Represents possible payment tokens for purchasing SGCC tokens
 */
export type PaymentTokenType = 'ETH' | 'USDT' | 'USDC';

/**
 * Document interface for token purchases
 */
export type TokenPurchaseDocument = TokenPurchase & Document;

/**
 * Schema for token purchases
 */
@Schema({
  timestamps: true,
  collection: 'token_purchases',
})
export class TokenPurchase {
  /**
   * Ethereum wallet address to receive tokens
   */
  @Prop({ required: true })
  walletAddress: string;

  /**
   * Amount of tokens to purchase
   */
  @Prop({ required: true })
  amount: string;

  /**
   * Selected payment token type (ETH, USDT, USDC)
   */
  @Prop({ required: true, enum: ['ETH', 'USDT', 'USDC'] })
  selectedPaymentToken: PaymentTokenType;

  /**
   * Amount of payment token
   */
  @Prop({ required: true })
  paymentAmount: string;

  /**
   * Transaction hash of the payment transaction
   */
  @Prop({ required: true })
  paymentTxHash: string;

  /**
   * Flag indicating if the token purchase has been fulfilled
   */
  @Prop({ default: false })
  fulfilled: boolean;

  /**
   * Transaction hash when fulfilled
   */
  @Prop()
  txHash?: string;
}

export const TokenPurchaseSchema = SchemaFactory.createForClass(TokenPurchase);
