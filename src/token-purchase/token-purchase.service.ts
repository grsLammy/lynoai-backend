import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PurchaseTokenDto } from './dto';
import {
  TokenPurchase,
  TokenPurchaseDocument,
} from './schemas/token-purchase.schema';

/**
 * Service for handling $LYNO token purchases
 * Note: All token amounts are expected to be in wei
 */
@Injectable()
export class TokenPurchaseService {
  private readonly logger = new Logger(TokenPurchaseService.name);

  constructor(
    @InjectModel(TokenPurchase.name)
    private tokenPurchaseModel: Model<TokenPurchaseDocument>,
  ) {}

  /**
   * Create a new token purchase request
   * @param purchaseTokenDto Token purchase details
   * @returns The created token purchase document
   */
  async createTokenPurchase(
    purchaseTokenDto: PurchaseTokenDto,
  ): Promise<TokenPurchaseDocument> {
    this.logger.log(
      `Creating token purchase for wallet ${purchaseTokenDto.walletAddress}`,
    );

    const tokenPurchase = new this.tokenPurchaseModel({
      walletAddress: purchaseTokenDto.walletAddress,
      amount: purchaseTokenDto.amount,
      selectedPaymentToken: purchaseTokenDto.selectedPaymentToken,
      paymentAmount: purchaseTokenDto.paymentAmount,
      fulfilled: false,
    });

    return tokenPurchase.save();
  }

  /**
   * Get all token purchases
   * @returns Array of all token purchases
   */
  async getAllTokenPurchases(): Promise<TokenPurchaseDocument[]> {
    this.logger.log('Retrieving all token purchases');
    return this.tokenPurchaseModel.find().exec();
  }

  /**
   * Get a token purchase by ID
   * @param id The token purchase ID
   * @returns The token purchase document
   */
  async getTokenPurchaseById(id: string): Promise<TokenPurchaseDocument> {
    this.logger.log(`Retrieving token purchase with ID: ${id}`);
    const tokenPurchase = await this.tokenPurchaseModel.findById(id).exec();

    if (!tokenPurchase) {
      throw new NotFoundException(`Token purchase with ID ${id} not found`);
    }

    return tokenPurchase;
  }

  /**
   * Get token purchases by wallet address
   * @param walletAddress Ethereum wallet address
   * @returns Array of token purchases for the wallet address
   */
  async getTokenPurchasesByWalletAddress(
    walletAddress: string,
  ): Promise<TokenPurchaseDocument[]> {
    this.logger.log(
      `Retrieving token purchases for wallet address: ${walletAddress}`,
    );

    const purchases = await this.tokenPurchaseModel
      .find({ walletAddress })
      .exec();

    if (!purchases.length) {
      this.logger.warn(`No token purchases found for wallet: ${walletAddress}`);
    }

    return purchases;
  }

  /**
   * Get all fulfilled token purchases
   * @returns Array of fulfilled token purchases
   */
  async getFulfilledTokenPurchases(): Promise<TokenPurchaseDocument[]> {
    this.logger.log('Retrieving all fulfilled token purchases');
    return this.tokenPurchaseModel.find({ fulfilled: true }).exec();
  }

  /**
   * Get all pending (unfulfilled) token purchases
   * @returns Array of pending token purchases
   */
  async getPendingTokenPurchases(): Promise<TokenPurchaseDocument[]> {
    this.logger.log('Retrieving all pending token purchases');
    return this.tokenPurchaseModel.find({ fulfilled: false }).exec();
  }

  /**
   * Mark a token purchase as fulfilled
   * @param id Token purchase ID to fulfill
   * @param txHash Transaction hash from the blockchain
   * @returns The updated token purchase
   */
  async fulfillTokenPurchase(
    id: string,
    txHash: string,
  ): Promise<TokenPurchaseDocument> {
    this.logger.log(`Fulfilling token purchase with ID: ${id}`);
    const tokenPurchase = await this.getTokenPurchaseById(id);

    if (tokenPurchase.fulfilled) {
      this.logger.warn(`Token purchase ${id} is already fulfilled`);
      return tokenPurchase;
    }

    tokenPurchase.fulfilled = true;
    tokenPurchase.txHash = txHash;

    return tokenPurchase.save();
  }
}
