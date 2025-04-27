/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { TokenPurchaseController } from './token-purchase.controller';
import { TokenPurchaseService } from './token-purchase.service';
import { PurchaseTokenDto } from './dto';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request } from 'express';

// Define a simple interface for our tests - using wallet address instead of email/JWT
interface UserInfo {
  walletAddress: string;
}

// Instead of mocking, we'll directly create mock implementations
// This avoids the import issues with decorators
const mockApplySecurity = jest.fn();
const mockRoles = jest.fn();

describe('TokenPurchaseController', () => {
  let controller: TokenPurchaseController;
  let service: TokenPurchaseService;

  const mockTokenPurchaseService = {
    createTokenPurchase: jest.fn(),
    getTokenPurchasesByWalletAddress: jest.fn(),
    getFulfilledTokenPurchases: jest.fn(),
    getPendingTokenPurchases: jest.fn(),
  };

  // Mock Logger to avoid console output during tests
  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TokenPurchaseController],
      providers: [
        {
          provide: TokenPurchaseService,
          useValue: mockTokenPurchaseService,
        },
      ],
    })
      .overrideProvider(Logger)
      .useValue(mockLogger)
      .compile();

    controller = module.get<TokenPurchaseController>(TokenPurchaseController);
    service = module.get<TokenPurchaseService>(TokenPurchaseService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTokenPurchase', () => {
    const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

    const purchaseTokenDto: PurchaseTokenDto = {
      walletAddress: walletAddress,
      amount: '1000000000000000000',
      selectedPaymentToken: 'ETH',
      paymentAmount: '100',
    };

    // For MongoDB structure - using wallet address as the identifier
    const mockRequest = {
      user: {
        walletAddress: walletAddress,
      } as UserInfo,
    } as Partial<Request>;

    const mockResponse = {
      walletAddress: walletAddress,
      amount: '1000000000000000000',
      selectedPaymentToken: 'ETH',
      paymentAmount: '100',
      fulfilled: false,
    };

    it('should call service.createTokenPurchase with correct parameters and return result', async () => {
      mockTokenPurchaseService.createTokenPurchase.mockResolvedValue(
        mockResponse,
      );

      const result = await controller.createTokenPurchase(purchaseTokenDto);

      expect(service.createTokenPurchase).toHaveBeenCalledWith(
        purchaseTokenDto,
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw an HttpException when service throws an error', async () => {
      const errorMessage = 'Service error';
      mockTokenPurchaseService.createTokenPurchase.mockRejectedValue(
        new Error(errorMessage),
      );

      try {
        await controller.createTokenPurchase(purchaseTokenDto);
        fail('Expected HttpException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should throw an HttpException with original status when service throws an HttpException', async () => {
      const errorMessage = 'Bad Request';
      const httpException = new HttpException(
        errorMessage,
        HttpStatus.BAD_REQUEST,
      );
      mockTokenPurchaseService.createTokenPurchase.mockRejectedValue(
        httpException,
      );

      try {
        await controller.createTokenPurchase(purchaseTokenDto);
        fail('Expected HttpException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('Payment token tests', () => {
    it('should handle USDT token purchase', async () => {
      const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

      const usdtPurchaseDto: PurchaseTokenDto = {
        walletAddress: walletAddress,
        amount: '1000000000000000000',
        selectedPaymentToken: 'USDT',
        paymentAmount: '100',
      };

      const usdtMockResponse = {
        walletAddress: walletAddress,
        amount: '1000000000000000000',
        selectedPaymentToken: 'USDT',
        paymentAmount: '100',
        fulfilled: false,
      };

      mockTokenPurchaseService.createTokenPurchase.mockResolvedValue(
        usdtMockResponse,
      );

      const result = await controller.createTokenPurchase(usdtPurchaseDto);

      expect(service.createTokenPurchase).toHaveBeenCalledWith(usdtPurchaseDto);
      expect(result).toEqual(usdtMockResponse);
    });

    it('should handle USDC token purchase', async () => {
      const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

      const usdcPurchaseDto: PurchaseTokenDto = {
        walletAddress: walletAddress,
        amount: '1000000000000000000',
        selectedPaymentToken: 'USDC',
        paymentAmount: '100',
      };

      const usdcMockResponse = {
        walletAddress: walletAddress,
        amount: '1000000000000000000',
        selectedPaymentToken: 'USDC',
        paymentAmount: '100',
        fulfilled: false,
      };

      mockTokenPurchaseService.createTokenPurchase.mockResolvedValue(
        usdcMockResponse,
      );

      const result = await controller.createTokenPurchase(usdcPurchaseDto);

      expect(service.createTokenPurchase).toHaveBeenCalledWith(usdcPurchaseDto);
      expect(result).toEqual(usdcMockResponse);
    });
  });

  // Tests for new endpoints
  describe('getTokenPurchasesByWalletAddress', () => {
    const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const mockPurchases = [
      {
        walletAddress,
        amount: '1000000000000000000',
        selectedPaymentToken: 'ETH',
        paymentAmount: '0.5',
        fulfilled: false,
      },
      {
        walletAddress,
        amount: '2000000000000000000',
        selectedPaymentToken: 'USDT',
        paymentAmount: '100',
        fulfilled: true,
      },
    ];

    it('should return purchases for a given wallet address', async () => {
      mockTokenPurchaseService.getTokenPurchasesByWalletAddress.mockResolvedValue(
        mockPurchases,
      );

      const result =
        await controller.getTokenPurchasesByWalletAddress(walletAddress);

      expect(service.getTokenPurchasesByWalletAddress).toHaveBeenCalledWith(
        walletAddress,
      );
      expect(result).toEqual(mockPurchases);
    });

    it('should handle empty results', async () => {
      mockTokenPurchaseService.getTokenPurchasesByWalletAddress.mockResolvedValue(
        [],
      );

      const result =
        await controller.getTokenPurchasesByWalletAddress(walletAddress);

      expect(service.getTokenPurchasesByWalletAddress).toHaveBeenCalledWith(
        walletAddress,
      );
      expect(result).toEqual([]);
    });

    it('should throw an HttpException when service throws an error', async () => {
      const errorMessage = 'Service error';
      mockTokenPurchaseService.getTokenPurchasesByWalletAddress.mockRejectedValue(
        new Error(errorMessage),
      );

      try {
        await controller.getTokenPurchasesByWalletAddress(walletAddress);
        fail('Expected HttpException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getFulfilledTokenPurchases', () => {
    const mockFulfilledPurchases = [
      {
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        amount: '1000000000000000000',
        selectedPaymentToken: 'ETH',
        paymentAmount: '0.5',
        fulfilled: true,
        txHash:
          '0x4f9cdc85efc39d3ffcf9b659a1cb2c4c5605dde0dbc97a8e02dfc69558cad94b',
      },
      {
        walletAddress: '0x123abc456def789',
        amount: '2000000000000000000',
        selectedPaymentToken: 'USDT',
        paymentAmount: '100',
        fulfilled: true,
        txHash:
          '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      },
    ];

    it('should return fulfilled token purchases', async () => {
      mockTokenPurchaseService.getFulfilledTokenPurchases.mockResolvedValue(
        mockFulfilledPurchases,
      );

      const result = await controller.getFulfilledTokenPurchases();

      expect(service.getFulfilledTokenPurchases).toHaveBeenCalled();
      expect(result).toEqual(mockFulfilledPurchases);
    });

    it('should handle empty results', async () => {
      mockTokenPurchaseService.getFulfilledTokenPurchases.mockResolvedValue([]);

      const result = await controller.getFulfilledTokenPurchases();

      expect(service.getFulfilledTokenPurchases).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw an HttpException when service throws an error', async () => {
      const errorMessage = 'Service error';
      mockTokenPurchaseService.getFulfilledTokenPurchases.mockRejectedValue(
        new Error(errorMessage),
      );

      try {
        await controller.getFulfilledTokenPurchases();
        fail('Expected HttpException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getPendingTokenPurchases', () => {
    const mockPendingPurchases = [
      {
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        amount: '1000000000000000000',
        selectedPaymentToken: 'ETH',
        paymentAmount: '0.5',
        fulfilled: false,
      },
      {
        walletAddress: '0x123abc456def789',
        amount: '2000000000000000000',
        selectedPaymentToken: 'USDC',
        paymentAmount: '100',
        fulfilled: false,
      },
    ];

    it('should return pending token purchases', async () => {
      mockTokenPurchaseService.getPendingTokenPurchases.mockResolvedValue(
        mockPendingPurchases,
      );

      const result = await controller.getPendingTokenPurchases();

      expect(service.getPendingTokenPurchases).toHaveBeenCalled();
      expect(result).toEqual(mockPendingPurchases);
    });

    it('should handle empty results', async () => {
      mockTokenPurchaseService.getPendingTokenPurchases.mockResolvedValue([]);

      const result = await controller.getPendingTokenPurchases();

      expect(service.getPendingTokenPurchases).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw an HttpException when service throws an error', async () => {
      const errorMessage = 'Service error';
      mockTokenPurchaseService.getPendingTokenPurchases.mockRejectedValue(
        new Error(errorMessage),
      );

      try {
        await controller.getPendingTokenPurchases();
        fail('Expected HttpException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
