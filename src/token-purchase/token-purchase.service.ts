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

  /**
   * Fulfill all pending token purchases for a specific wallet address
   * @param walletAddress Ethereum wallet address
   * @param txHash Transaction hash from the blockchain
   * @returns Array of updated token purchases
   */
  async fulfillTokenPurchaseByWalletAddress(
    walletAddress: string,
    txHash: string,
  ): Promise<TokenPurchaseDocument[]> {
    this.logger.log(
      `Fulfilling all pending token purchases for wallet: ${walletAddress}`,
    );

    // Find all pending token purchases for the wallet address
    const pendingPurchases = await this.tokenPurchaseModel
      .find({ walletAddress, fulfilled: false })
      .exec();

    if (!pendingPurchases.length) {
      this.logger.warn(
        `No pending token purchases found for wallet: ${walletAddress}`,
      );
      return [];
    }

    // Update all pending purchases
    const updatedPurchases = await Promise.all(
      pendingPurchases.map(async (purchase) => {
        purchase.fulfilled = true;
        purchase.txHash = txHash;
        return purchase.save();
      }),
    );

    this.logger.log(
      `Successfully fulfilled ${updatedPurchases.length} token purchases for wallet: ${walletAddress}`,
    );
    return updatedPurchases;
  }

  /**
   * Fulfill multiple token purchases by their IDs
   * @param ids Array of token purchase IDs
   * @param txHash Transaction hash from the blockchain
   * @returns Array of updated token purchases
   */
  async fulfillTokenPurchasesByIds(
    ids: string[],
    txHash: string,
  ): Promise<TokenPurchaseDocument[]> {
    this.logger.log(`Fulfilling token purchases with IDs: ${ids.join(', ')}`);

    // Validate all IDs exist before updating any
    const purchases = await Promise.all(
      ids.map(async (id) => {
        try {
          return await this.getTokenPurchaseById(id);
        } catch (error) {
          // Type-safe error handling
          if (error instanceof Error) {
            this.logger.error(
              `Error retrieving token purchase with ID: ${id}. ${error.message}`,
            );
          } else {
            this.logger.error(
              `Unknown error retrieving token purchase with ID: ${id}`,
            );
          }
          throw error; // Re-throw to be caught by controller
        }
      }),
    );

    // Update all purchases
    const updatedPurchases = await Promise.all(
      purchases.map(async (purchase) => {
        if (purchase.fulfilled) {
          this.logger.warn(
            `Token purchase ${String(purchase._id)} is already fulfilled. Skipping.`,
          );
          return purchase;
        }

        purchase.fulfilled = true;
        purchase.txHash = txHash;
        return purchase.save();
      }),
    );

    this.logger.log(
      `Successfully fulfilled ${updatedPurchases.length} token purchases`,
    );
    return updatedPurchases;
  }

  /**
   * Fulfill all pending token purchases for multiple wallet addresses
   * @param walletAddresses Array of Ethereum wallet addresses
   * @param txHash Transaction hash from the blockchain
   * @returns Array of updated token purchases
   */
  async fulfillTokenPurchasesByWalletAddresses(
    walletAddresses: string[],
    txHash: string,
  ): Promise<TokenPurchaseDocument[]> {
    this.logger.log(
      `Fulfilling token purchases for wallet addresses: ${walletAddresses.join(
        ', ',
      )}`,
    );

    // Find all pending token purchases for the provided wallet addresses
    const pendingPurchases = await this.tokenPurchaseModel
      .find({
        walletAddress: { $in: walletAddresses },
        fulfilled: false,
      })
      .exec();

    if (!pendingPurchases.length) {
      this.logger.warn(
        `No pending token purchases found for the provided wallet addresses`,
      );
      return [];
    }

    // Update all pending purchases
    const updatedPurchases = await Promise.all(
      pendingPurchases.map(async (purchase) => {
        purchase.fulfilled = true;
        purchase.txHash = txHash;
        return purchase.save();
      }),
    );

    // Group results by wallet address for logging
    const walletCounts: Record<string, number> = updatedPurchases.reduce(
      (acc: Record<string, number>, purchase) => {
        const wallet = purchase.walletAddress;
        acc[wallet] = (acc[wallet] || 0) + 1;
        return acc;
      },
      {},
    );

    for (const [wallet, count] of Object.entries(walletCounts)) {
      this.logger.log(
        `Fulfilled ${count} purchases for wallet: ${String(wallet)}`,
      );
    }

    this.logger.log(
      `Successfully fulfilled ${updatedPurchases.length} token purchases across ${
        Object.keys(walletCounts).length
      } wallets`,
    );
    return updatedPurchases;
  }

  /**
   * Fulfill all pending token purchases with a single transaction hash
   * @param txHash Transaction hash from the blockchain
   * @returns Array of updated token purchases
   */
  async fulfillAllPendingTokenPurchases(
    txHash: string,
  ): Promise<TokenPurchaseDocument[]> {
    this.logger.log(
      `Fulfilling all pending token purchases with transaction hash: ${txHash}`,
    );

    // Get all pending token purchases
    const pendingPurchases = await this.getPendingTokenPurchases();

    if (!pendingPurchases.length) {
      this.logger.warn('No pending token purchases found to fulfill');
      return [];
    }

    // Update all pending purchases
    const updatedPurchases = await Promise.all(
      pendingPurchases.map(async (purchase) => {
        purchase.fulfilled = true;
        purchase.txHash = txHash;
        return purchase.save();
      }),
    );

    this.logger.log(
      `Successfully fulfilled ${updatedPurchases.length} token purchases`,
    );

    // Group results by wallet address for logging
    const walletCounts: Record<string, number> = updatedPurchases.reduce(
      (acc: Record<string, number>, purchase) => {
        const wallet = purchase.walletAddress;
        acc[wallet] = (acc[wallet] || 0) + 1;
        return acc;
      },
      {},
    );

    for (const [wallet, count] of Object.entries(walletCounts)) {
      this.logger.log(
        `Fulfilled ${count} purchases for wallet: ${String(wallet)}`,
      );
    }

    this.logger.log(
      `Successfully fulfilled ${updatedPurchases.length} token purchases across ${
        Object.keys(walletCounts).length
      } wallets`,
    );

    return updatedPurchases;
  }
}
