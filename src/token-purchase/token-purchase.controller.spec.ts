/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { TokenPurchaseController } from './token-purchase.controller';
import { TokenPurchaseService } from './token-purchase.service';
import { PurchaseTokenDto } from './dto';
import {
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentTokenType } from './schemas/token-purchase.schema';
import { FulfillAllPendingDto } from './dto';

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
    getTokenPurchaseById: jest.fn(),
    getAllTokenPurchases: jest.fn(),
    fulfillTokenPurchase: jest.fn(),
    fulfillTokenPurchaseByWalletAddress: jest.fn(),
    fulfillTokenPurchasesByIds: jest.fn(),
    fulfillTokenPurchasesByWalletAddresses: jest.fn(),
    fulfillAllPendingTokenPurchases: jest.fn(),
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

  describe('getTokenPurchaseById', () => {
    const id = '60d21b4667d0d8992e610c85';
    const mockPurchase = {
      _id: id,
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      amount: '1000000000000000000',
      selectedPaymentToken: 'ETH',
      paymentAmount: '0.5',
      fulfilled: false,
    };

    it('should return a purchase by its ID', async () => {
      mockTokenPurchaseService.getTokenPurchaseById.mockResolvedValue(
        mockPurchase,
      );

      const result = await controller.getTokenPurchaseById(id);

      expect(service.getTokenPurchaseById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPurchase);
    });

    it('should throw an HttpException when service throws an error', async () => {
      const errorMessage = 'Purchase not found';
      mockTokenPurchaseService.getTokenPurchaseById.mockRejectedValue(
        new Error(errorMessage),
      );

      try {
        await controller.getTokenPurchaseById(id);
        fail('Expected HttpException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getAllTokenPurchases', () => {
    const mockPurchases = [
      {
        _id: '60d21b4667d0d8992e610c85',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        amount: '1000000000000000000',
        selectedPaymentToken: 'ETH',
        paymentAmount: '0.5',
        fulfilled: false,
      },
      {
        _id: '60d21b4667d0d8992e610c86',
        walletAddress: '0x123abc456def789',
        amount: '2000000000000000000',
        selectedPaymentToken: 'USDC',
        paymentAmount: '100',
        fulfilled: true,
      },
    ];

    it('should return all token purchases', async () => {
      mockTokenPurchaseService.getAllTokenPurchases.mockResolvedValue(
        mockPurchases,
      );

      const result = await controller.getAllTokenPurchases();

      expect(service.getAllTokenPurchases).toHaveBeenCalled();
      expect(result).toEqual(mockPurchases);
    });

    it('should throw an HttpException when service throws an error', async () => {
      const errorMessage = 'Database error';
      mockTokenPurchaseService.getAllTokenPurchases.mockRejectedValue(
        new Error(errorMessage),
      );

      try {
        await controller.getAllTokenPurchases();
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

  // Tests for fulfillment endpoints
  describe('fulfillTokenPurchase', () => {
    const id = '60d21b4667d0d8992e610c85';
    const txHash =
      '0x4f9cdc85efc39d3ffcf9b659a1cb2c4c5605dde0dbc97a8e02dfc69558cad94b';
    const mockPurchase = {
      _id: id,
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      amount: '1000000000000000000',
      selectedPaymentToken: 'ETH',
      paymentAmount: '0.5',
      fulfilled: true,
      txHash: txHash,
    };

    it('should fulfill a token purchase by ID', async () => {
      mockTokenPurchaseService.fulfillTokenPurchase.mockResolvedValue(
        mockPurchase,
      );

      const result = await controller.fulfillTokenPurchase(id, txHash);

      expect(service.fulfillTokenPurchase).toHaveBeenCalledWith(id, txHash);
      expect(result).toEqual(mockPurchase);
    });

    it('should throw an HttpException when service throws an error', async () => {
      const errorMessage = 'Token purchase not found';
      mockTokenPurchaseService.fulfillTokenPurchase.mockRejectedValue(
        new Error(errorMessage),
      );

      try {
        await controller.fulfillTokenPurchase(id, txHash);
        fail('Expected HttpException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('fulfillTokenPurchaseByWalletAddress', () => {
    const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const txHash =
      '0x4f9cdc85efc39d3ffcf9b659a1cb2c4c5605dde0dbc97a8e02dfc69558cad94b';
    const mockFulfilledPurchases = [
      {
        walletAddress: walletAddress,
        amount: '1000000000000000000',
        selectedPaymentToken: 'ETH',
        paymentAmount: '0.5',
        fulfilled: true,
        txHash: txHash,
      },
      {
        walletAddress: walletAddress,
        amount: '2000000000000000000',
        selectedPaymentToken: 'USDT',
        paymentAmount: '100',
        fulfilled: true,
        txHash: txHash,
      },
    ];

    it('should fulfill purchases for a wallet address', async () => {
      mockTokenPurchaseService.fulfillTokenPurchaseByWalletAddress.mockResolvedValue(
        mockFulfilledPurchases,
      );

      const result = await controller.fulfillTokenPurchaseByWalletAddress(
        walletAddress,
        txHash,
      );

      expect(service.fulfillTokenPurchaseByWalletAddress).toHaveBeenCalledWith(
        walletAddress,
        txHash,
      );
      expect(result).toEqual(mockFulfilledPurchases);
    });

    it('should handle empty results', async () => {
      mockTokenPurchaseService.fulfillTokenPurchaseByWalletAddress.mockResolvedValue(
        [],
      );

      const result = await controller.fulfillTokenPurchaseByWalletAddress(
        walletAddress,
        txHash,
      );

      expect(service.fulfillTokenPurchaseByWalletAddress).toHaveBeenCalledWith(
        walletAddress,
        txHash,
      );
      expect(result).toEqual([]);
    });

    it('should throw an HttpException when service throws an error', async () => {
      const errorMessage = 'Service error';
      mockTokenPurchaseService.fulfillTokenPurchaseByWalletAddress.mockRejectedValue(
        new Error(errorMessage),
      );

      try {
        await controller.fulfillTokenPurchaseByWalletAddress(
          walletAddress,
          txHash,
        );
        fail('Expected HttpException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('fulfillTokenPurchasesByIds', () => {
    const ids = ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'];
    const txHash =
      '0x4f9cdc85efc39d3ffcf9b659a1cb2c4c5605dde0dbc97a8e02dfc69558cad94b';
    const fulfillByIdsDto = { ids, txHash };
    const mockFulfilledPurchases = [
      {
        _id: ids[0],
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        amount: '1000000000000000000',
        selectedPaymentToken: 'ETH',
        paymentAmount: '0.5',
        fulfilled: true,
        txHash: txHash,
      },
      {
        _id: ids[1],
        walletAddress: '0x123abc456def789',
        amount: '2000000000000000000',
        selectedPaymentToken: 'USDT',
        paymentAmount: '100',
        fulfilled: true,
        txHash: txHash,
      },
    ];

    it('should fulfill purchases by their IDs', async () => {
      mockTokenPurchaseService.fulfillTokenPurchasesByIds.mockResolvedValue(
        mockFulfilledPurchases,
      );

      const result =
        await controller.fulfillTokenPurchasesByIds(fulfillByIdsDto);

      expect(service.fulfillTokenPurchasesByIds).toHaveBeenCalledWith(
        ids,
        txHash,
      );
      expect(result).toEqual(mockFulfilledPurchases);
    });

    it('should handle empty results', async () => {
      mockTokenPurchaseService.fulfillTokenPurchasesByIds.mockResolvedValue([]);

      const result =
        await controller.fulfillTokenPurchasesByIds(fulfillByIdsDto);

      expect(service.fulfillTokenPurchasesByIds).toHaveBeenCalledWith(
        ids,
        txHash,
      );
      expect(result).toEqual([]);
    });

    it('should throw an HttpException when service throws an error', async () => {
      const errorMessage = 'Service error';
      mockTokenPurchaseService.fulfillTokenPurchasesByIds.mockRejectedValue(
        new Error(errorMessage),
      );

      try {
        await controller.fulfillTokenPurchasesByIds(fulfillByIdsDto);
        fail('Expected HttpException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('fulfillTokenPurchasesByWalletAddresses', () => {
    const walletAddresses = [
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
    ];
    const txHash =
      '0x4f9cdc85efc39d3ffcf9b659a1cb2c4c5605dde0dbc97a8e02dfc69558cad94b';
    const fulfillByWalletAddressesDto = { walletAddresses, txHash };
    const mockFulfilledPurchases = [
      {
        walletAddress: walletAddresses[0],
        amount: '1000000000000000000',
        selectedPaymentToken: 'ETH',
        paymentAmount: '0.5',
        fulfilled: true,
        txHash: txHash,
      },
      {
        walletAddress: walletAddresses[1],
        amount: '2000000000000000000',
        selectedPaymentToken: 'USDT',
        paymentAmount: '100',
        fulfilled: true,
        txHash: txHash,
      },
    ];

    it('should fulfill purchases for multiple wallet addresses', async () => {
      mockTokenPurchaseService.fulfillTokenPurchasesByWalletAddresses.mockResolvedValue(
        mockFulfilledPurchases,
      );

      const result = await controller.fulfillTokenPurchasesByWalletAddresses(
        fulfillByWalletAddressesDto,
      );

      expect(
        service.fulfillTokenPurchasesByWalletAddresses,
      ).toHaveBeenCalledWith(walletAddresses, txHash);
      expect(result).toEqual(mockFulfilledPurchases);
    });

    it('should handle empty results', async () => {
      mockTokenPurchaseService.fulfillTokenPurchasesByWalletAddresses.mockResolvedValue(
        [],
      );

      const result = await controller.fulfillTokenPurchasesByWalletAddresses(
        fulfillByWalletAddressesDto,
      );

      expect(
        service.fulfillTokenPurchasesByWalletAddresses,
      ).toHaveBeenCalledWith(walletAddresses, txHash);
      expect(result).toEqual([]);
    });

    it('should throw an HttpException when service throws an error', async () => {
      const errorMessage = 'Service error';
      mockTokenPurchaseService.fulfillTokenPurchasesByWalletAddresses.mockRejectedValue(
        new Error(errorMessage),
      );

      try {
        await controller.fulfillTokenPurchasesByWalletAddresses(
          fulfillByWalletAddressesDto,
        );
        fail('Expected HttpException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('fulfillAllPendingTokenPurchases', () => {
    const mockFulfillAllPendingDto: FulfillAllPendingDto = {
      txHash:
        '0x4f9cdc85efc39d3ffcf9b659a1cb2c4c5605dde0dbc97a8e02dfc69558cad94b',
    };

    it('should fulfill all pending token purchases', async () => {
      // Create fulfilled mock purchases
      const mockFulfilledPurchase1 = {
        _id: '60d21b4667d0d8992e610c85',
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        amount: '1000000000000000000',
        selectedPaymentToken: 'ETH' as PaymentTokenType,
        paymentAmount: '0.5',
        fulfilled: true,
        txHash: mockFulfillAllPendingDto.txHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockFulfilledPurchase2 = {
        _id: '60d21b4667d0d8992e610c86',
        walletAddress: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
        amount: '2000000000000000000',
        selectedPaymentToken: 'USDT' as PaymentTokenType,
        paymentAmount: '100',
        fulfilled: true,
        txHash: mockFulfillAllPendingDto.txHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set up the mock service to return the expected result
      mockTokenPurchaseService.fulfillAllPendingTokenPurchases.mockResolvedValue(
        [mockFulfilledPurchase1, mockFulfilledPurchase2],
      );

      // Call the controller method
      const result = await controller.fulfillAllPendingTokenPurchases(
        mockFulfillAllPendingDto,
      );

      // Assertions
      expect(service.fulfillAllPendingTokenPurchases).toHaveBeenCalledWith(
        mockFulfillAllPendingDto.txHash,
      );
      expect(result).toEqual([mockFulfilledPurchase1, mockFulfilledPurchase2]);
    });

    it('should handle errors gracefully', async () => {
      // Set up the mock service to throw an error
      mockTokenPurchaseService.fulfillAllPendingTokenPurchases.mockRejectedValue(
        new Error('Test error'),
      );

      // Call the controller method and expect it to throw HttpException
      await expect(
        controller.fulfillAllPendingTokenPurchases(mockFulfillAllPendingDto),
      ).rejects.toThrow(HttpException);
    });

    it('should return empty array when no pending purchases exist', async () => {
      // Set up the mock service to return an empty array
      mockTokenPurchaseService.fulfillAllPendingTokenPurchases.mockResolvedValue(
        [],
      );

      // Call the controller method
      const result = await controller.fulfillAllPendingTokenPurchases(
        mockFulfillAllPendingDto,
      );

      // Assertions
      expect(service.fulfillAllPendingTokenPurchases).toHaveBeenCalledWith(
        mockFulfillAllPendingDto.txHash,
      );
      expect(result).toEqual([]);
    });
  });
});
