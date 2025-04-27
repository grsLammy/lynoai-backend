import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { TokenPurchaseService } from './token-purchase.service';
import { PurchaseTokenDto } from './dto';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('token-purchase')
@Controller('token-purchase')
export class TokenPurchaseController {
  private readonly logger = new Logger(TokenPurchaseController.name);

  constructor(private readonly tokenPurchaseService: TokenPurchaseService) {}

  /**
   * Create a new token purchase request
   * @param purchaseTokenDto Token purchase details
   * @returns The created token purchase
   */
  @Post()
  @ApiOperation({
    summary: 'Create a token purchase request',
    description:
      'Create a new token purchase request using the specified payment token',
  })
  @ApiBody({
    type: PurchaseTokenDto,
    examples: {
      eth: {
        summary: 'ETH payment',
        value: {
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          amount: '1000000000000000000',
          selectedPaymentToken: 'ETH',
          paymentAmount: '0.5',
        },
      },
      usdt: {
        summary: 'USDT payment',
        value: {
          walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
          amount: '1000000000000000000',
          selectedPaymentToken: 'USDT',
          paymentAmount: '100',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Token purchase request created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input',
  })
  async createTokenPurchase(@Body() purchaseTokenDto: PurchaseTokenDto) {
    try {
      this.logger.log(
        `Processing token purchase request for wallet ${purchaseTokenDto.walletAddress}`,
      );

      return await this.tokenPurchaseService.createTokenPurchase(
        purchaseTokenDto,
      );
    } catch (error) {
      this.logger.error(
        `Error in createTokenPurchase controller: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal Server Error',
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get all token purchases
   * @returns Array of all token purchases
   */
  @Get()
  @ApiOperation({
    summary: 'Get all token purchases',
    description: 'Retrieve all token purchase requests',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all token purchases',
  })
  async getAllTokenPurchases() {
    try {
      return await this.tokenPurchaseService.getAllTokenPurchases();
    } catch (error) {
      this.logger.error(
        `Error in getAllTokenPurchases controller: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal Server Error',
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get token purchases by wallet address
   * @param walletAddress Ethereum wallet address to filter by
   * @returns Array of token purchases for the provided wallet address
   */
  @Get('wallet/:walletAddress')
  @ApiOperation({
    summary: 'Get token purchases by wallet address',
    description: 'Retrieve all token purchases for a specific wallet address',
  })
  @ApiParam({
    name: 'walletAddress',
    description: 'Ethereum wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  @ApiResponse({
    status: 200,
    description: 'List of token purchases for the wallet address',
  })
  async getTokenPurchasesByWalletAddress(
    @Param('walletAddress') walletAddress: string,
  ) {
    try {
      return await this.tokenPurchaseService.getTokenPurchasesByWalletAddress(
        walletAddress,
      );
    } catch (error) {
      this.logger.error(
        `Error in getTokenPurchasesByWalletAddress controller: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal Server Error',
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get fulfilled token purchases
   * @returns Array of fulfilled token purchases
   */
  @Get('fulfilled')
  @ApiOperation({
    summary: 'Get fulfilled token purchases',
    description: 'Retrieve all token purchases that have been fulfilled',
  })
  @ApiResponse({
    status: 200,
    description: 'List of fulfilled token purchases',
  })
  async getFulfilledTokenPurchases() {
    try {
      return await this.tokenPurchaseService.getFulfilledTokenPurchases();
    } catch (error) {
      this.logger.error(
        `Error in getFulfilledTokenPurchases controller: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal Server Error',
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get pending token purchases
   * @returns Array of pending token purchases
   */
  @Get('pending')
  @ApiOperation({
    summary: 'Get pending token purchases',
    description:
      'Retrieve all token purchases that are pending (not fulfilled)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of pending token purchases',
  })
  async getPendingTokenPurchases() {
    try {
      return await this.tokenPurchaseService.getPendingTokenPurchases();
    } catch (error) {
      this.logger.error(
        `Error in getPendingTokenPurchases controller: ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal Server Error',
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a token purchase by ID
   * @param id The token purchase ID
   * @returns The token purchase
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get token purchase by ID',
    description: 'Retrieve a specific token purchase by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Token purchase ID',
    example: '60d21b4667d0d8992e610c85',
  })
  @ApiResponse({
    status: 200,
    description: 'Token purchase details',
  })
  @ApiResponse({
    status: 404,
    description: 'Token purchase not found',
  })
  async getTokenPurchaseById(@Param('id') id: string) {
    try {
      return await this.tokenPurchaseService.getTokenPurchaseById(id);
    } catch (error) {
      this.logger.error(
        `Error in getTokenPurchaseById controller: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal Server Error',
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Mark a token purchase as fulfilled
   * @param id The token purchase ID
   * @param txHash Transaction hash from the blockchain
   * @returns The updated token purchase
   */
  @Put(':id/fulfill')
  @ApiOperation({
    summary: 'Fulfill token purchase',
    description: 'Mark a token purchase as fulfilled with a transaction hash',
  })
  @ApiParam({
    name: 'id',
    description: 'Token purchase ID',
    example: '60d21b4667d0d8992e610c85',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        txHash: {
          type: 'string',
          example:
            '0x4f9cdc85efc39d3ffcf9b659a1cb2c4c5605dde0dbc97a8e02dfc69558cad94b',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token purchase fulfilled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Token purchase not found',
  })
  async fulfillTokenPurchase(
    @Param('id') id: string,
    @Body('txHash') txHash: string,
  ) {
    try {
      return await this.tokenPurchaseService.fulfillTokenPurchase(id, txHash);
    } catch (error) {
      this.logger.error(
        `Error in fulfillTokenPurchase controller: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new HttpException(
        error instanceof Error ? error.message : 'Internal Server Error',
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
