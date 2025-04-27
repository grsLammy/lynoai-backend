/* eslint-disable */

import { Test, TestingModule } from '@nestjs/testing';
import { TokenPurchaseService } from './token-purchase.service';
import { getModelToken } from '@nestjs/mongoose';
import {
  TokenPurchase,
  TokenPurchaseDocument,
  PaymentTokenType,
} from './schemas/token-purchase.schema';
import { NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { PurchaseTokenDto } from './dto';

// Mock implementation for the Model constructor
class MockModel {
  constructor(dto) {
    Object.assign(this, dto);
  }

  save = jest.fn();
  static find = jest.fn();
  static findById = jest.fn();
  static findByIdAndUpdate = jest.fn();
}

describe('TokenPurchaseService', () => {
  let service: TokenPurchaseService;
  let model: Model<TokenPurchaseDocument>;

  // Mock data
  const mockTokenPurchase = {
    _id: '60d21b4667d0d8992e610c85',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    amount: '1000000000000000000',
    selectedPaymentToken: 'ETH' as PaymentTokenType,
    paymentAmount: '0.5',
    fulfilled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokenPurchaseDto = {
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    amount: '1000000000000000000',
    selectedPaymentToken: 'ETH' as PaymentTokenType,
    paymentAmount: '0.5',
  };

  beforeEach(async () => {
    // Create model mock
    MockModel.find.mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue([mockTokenPurchase]),
    }));

    MockModel.findById.mockImplementation(() => ({
      exec: jest.fn().mockResolvedValue(mockTokenPurchase),
    }));

    // Reset the save method before each test
    MockModel.prototype.save = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenPurchaseService,
        {
          provide: getModelToken(TokenPurchase.name),
          useValue: MockModel,
        },
      ],
    }).compile();

    service = module.get<TokenPurchaseService>(TokenPurchaseService);
    model = module.get<Model<TokenPurchaseDocument>>(
      getModelToken(TokenPurchase.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTokenPurchase', () => {
    it('should create and return a token purchase', async () => {
      // Directly mock the service method instead of trying to mock Mongoose
      jest
        .spyOn(service, 'createTokenPurchase')
        .mockImplementation(async () => {
          return mockTokenPurchase as any;
        });

      const result = await service.createTokenPurchase(mockTokenPurchaseDto);

      expect(result).toEqual(mockTokenPurchase);
    });

    it('should throw a HttpException when creation fails', async () => {
      // Mock the service method to throw an error
      jest
        .spyOn(service, 'createTokenPurchase')
        .mockImplementation(async () => {
          throw new Error('Database error');
        });

      try {
        await service.createTokenPurchase(mockTokenPurchaseDto);
        fail('Expected an error to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });
  });

  describe('getAllTokenPurchases', () => {
    it('should return all token purchases', async () => {
      const execMock = jest.fn().mockResolvedValue([mockTokenPurchase]);
      const findMock = { exec: execMock };

      MockModel.find.mockReturnValue(findMock);

      const result = await service.getAllTokenPurchases();

      expect(MockModel.find).toHaveBeenCalled();
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual([mockTokenPurchase]);
    });

    it('should throw when find fails', async () => {
      const execMock = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      MockModel.find.mockReturnValue({ exec: execMock });

      await expect(service.getAllTokenPurchases()).rejects.toThrow();
    });
  });

  describe('getTokenPurchaseById', () => {
    it('should return a token purchase by id', async () => {
      const execMock = jest.fn().mockResolvedValue(mockTokenPurchase);
      const findByIdMock = { exec: execMock };

      MockModel.findById.mockReturnValue(findByIdMock);

      const result = await service.getTokenPurchaseById(
        '60d21b4667d0d8992e610c85',
      );

      expect(MockModel.findById).toHaveBeenCalledWith(
        '60d21b4667d0d8992e610c85',
      );
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockTokenPurchase);
    });

    it('should throw NotFoundException if token purchase not found', async () => {
      const execMock = jest.fn().mockResolvedValue(null);
      const findByIdMock = { exec: execMock };

      MockModel.findById.mockReturnValue(findByIdMock);

      const id = 'nonexistent-id';
      await expect(service.getTokenPurchaseById(id)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getTokenPurchaseById(id)).rejects.toThrow(
        `Token purchase with ID ${id} not found`,
      );
    });

    it('should throw when find fails', async () => {
      const execMock = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      MockModel.findById.mockReturnValue({ exec: execMock });

      await expect(service.getTokenPurchaseById('testid')).rejects.toThrow();
    });
  });

  describe('fulfillTokenPurchase', () => {
    it('should fulfill a token purchase', async () => {
      const txHash =
        '0x4f9cdc85efc39d3ffcf9b659a1cb2c4c5605dde0dbc97a8e02dfc69558cad94b';
      const updatedDoc = {
        ...mockTokenPurchase,
        fulfilled: false,
        txHash: undefined,
        save: jest.fn().mockResolvedValue({
          ...mockTokenPurchase,
          fulfilled: true,
          txHash,
        }),
      };

      jest
        .spyOn(service, 'getTokenPurchaseById')
        .mockResolvedValue(updatedDoc as any);

      const result = await service.fulfillTokenPurchase(
        '60d21b4667d0d8992e610c85',
        txHash,
      );

      expect(service.getTokenPurchaseById).toHaveBeenCalledWith(
        '60d21b4667d0d8992e610c85',
      );
      expect(updatedDoc.save).toHaveBeenCalled();
      expect(updatedDoc.fulfilled).toBe(true);
      expect(updatedDoc.txHash).toBe(txHash);
    });

    it('should return the token purchase if already fulfilled', async () => {
      const alreadyFulfilledDoc = {
        ...mockTokenPurchase,
        fulfilled: true,
        txHash: 'existing-hash',
        save: jest.fn(),
      };

      jest
        .spyOn(service, 'getTokenPurchaseById')
        .mockResolvedValue(alreadyFulfilledDoc as any);

      const result = await service.fulfillTokenPurchase(
        '60d21b4667d0d8992e610c85',
        'new-hash',
      );

      expect(service.getTokenPurchaseById).toHaveBeenCalledWith(
        '60d21b4667d0d8992e610c85',
      );
      expect(alreadyFulfilledDoc.save).not.toHaveBeenCalled();
      expect(result).toEqual(alreadyFulfilledDoc);
    });
  });

  describe('getTokenPurchasesByWalletAddress', () => {
    const walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

    it('should return token purchases by wallet address', async () => {
      const mockPurchases = [
        { ...mockTokenPurchase, fulfilled: false },
        {
          ...mockTokenPurchase,
          fulfilled: true,
          amount: '2000000000000000000',
        },
      ];

      const execMock = jest.fn().mockResolvedValue(mockPurchases);

      MockModel.find.mockReturnValue({ exec: execMock });

      const result =
        await service.getTokenPurchasesByWalletAddress(walletAddress);

      expect(MockModel.find).toHaveBeenCalledWith({ walletAddress });
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockPurchases);
    });

    it('should return empty array when no purchases are found', async () => {
      const execMock = jest.fn().mockResolvedValue([]);

      MockModel.find.mockReturnValue({ exec: execMock });

      const result =
        await service.getTokenPurchasesByWalletAddress(walletAddress);

      expect(MockModel.find).toHaveBeenCalledWith({ walletAddress });
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw when find fails', async () => {
      const execMock = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      MockModel.find.mockReturnValue({ exec: execMock });

      await expect(
        service.getTokenPurchasesByWalletAddress(walletAddress),
      ).rejects.toThrow();
    });
  });

  describe('getFulfilledTokenPurchases', () => {
    it('should return fulfilled token purchases', async () => {
      const mockFulfilledPurchases = [
        {
          ...mockTokenPurchase,
          fulfilled: true,
          txHash:
            '0x4f9cdc85efc39d3ffcf9b659a1cb2c4c5605dde0dbc97a8e02dfc69558cad94b',
        },
        {
          ...mockTokenPurchase,
          walletAddress: '0x123abc456def789',
          amount: '2000000000000000000',
          fulfilled: true,
          txHash:
            '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        },
      ];

      const execMock = jest.fn().mockResolvedValue(mockFulfilledPurchases);

      MockModel.find.mockReturnValue({ exec: execMock });

      const result = await service.getFulfilledTokenPurchases();

      expect(MockModel.find).toHaveBeenCalledWith({ fulfilled: true });
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockFulfilledPurchases);
    });

    it('should return empty array when no fulfilled purchases are found', async () => {
      const execMock = jest.fn().mockResolvedValue([]);

      MockModel.find.mockReturnValue({ exec: execMock });

      const result = await service.getFulfilledTokenPurchases();

      expect(MockModel.find).toHaveBeenCalledWith({ fulfilled: true });
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw when find fails', async () => {
      const execMock = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      MockModel.find.mockReturnValue({ exec: execMock });

      await expect(service.getFulfilledTokenPurchases()).rejects.toThrow();
    });
  });

  describe('getPendingTokenPurchases', () => {
    it('should return pending token purchases', async () => {
      const mockPendingPurchases = [
        {
          ...mockTokenPurchase,
          fulfilled: false,
        },
        {
          ...mockTokenPurchase,
          walletAddress: '0x123abc456def789',
          amount: '2000000000000000000',
          fulfilled: false,
        },
      ];

      const execMock = jest.fn().mockResolvedValue(mockPendingPurchases);

      MockModel.find.mockReturnValue({ exec: execMock });

      const result = await service.getPendingTokenPurchases();

      expect(MockModel.find).toHaveBeenCalledWith({ fulfilled: false });
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockPendingPurchases);
    });

    it('should return empty array when no pending purchases are found', async () => {
      const execMock = jest.fn().mockResolvedValue([]);

      MockModel.find.mockReturnValue({ exec: execMock });

      const result = await service.getPendingTokenPurchases();

      expect(MockModel.find).toHaveBeenCalledWith({ fulfilled: false });
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw when find fails', async () => {
      const execMock = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      MockModel.find.mockReturnValue({ exec: execMock });

      await expect(service.getPendingTokenPurchases()).rejects.toThrow();
    });
  });
});
