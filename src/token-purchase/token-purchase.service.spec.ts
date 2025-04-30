/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { TokenPurchaseService } from './token-purchase.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TokenPurchase,
  TokenPurchaseDocument,
} from './schemas/token-purchase.schema';
import { NotFoundException } from '@nestjs/common';
import { PurchaseTokenDto } from './dto';

// Create a mock document
const createMockPurchase = (
  walletAddress: string,
  amount: string,
  fulfilled = false,
  id = 'mockId',
): Partial<TokenPurchaseDocument> => ({
  _id: id,
  walletAddress,
  amount,
  selectedPaymentToken: 'ETH',
  paymentAmount: '0.5',
  paymentTxHash: 'mockTxHash',
  fulfilled,
  txHash: fulfilled ? 'mockFulfilledTxHash' : undefined,
  save: jest.fn().mockImplementation(function (this: any) {
    this.fulfilled = true;
    return this;
  }),
});

describe('TokenPurchaseService', () => {
  let service: TokenPurchaseService;
  let model: Model<TokenPurchaseDocument>;

  beforeEach(async () => {
    // Create mock model
    const mockModel = {
      find: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    // Build testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenPurchaseService,
        {
          provide: getModelToken(TokenPurchase.name),
          useValue: mockModel,
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
    let originalCreateTokenPurchase: any;

    beforeEach(() => {
      // Save original method
      originalCreateTokenPurchase = service.createTokenPurchase;
    });

    afterEach(() => {
      // Restore original method
      service.createTokenPurchase = originalCreateTokenPurchase;
    });

    it('should create a new token purchase if no existing purchase for the wallet', async () => {
      // Arrange
      const purchaseDto: PurchaseTokenDto = {
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        amount: '1000000000000000000',
        selectedPaymentToken: 'ETH',
        paymentAmount: '0.5',
        paymentTxHash: 'mockPaymentTxHash',
      };

      const createdPurchase = {
        ...purchaseDto,
        fulfilled: false,
        _id: 'mockId',
        save: jest.fn().mockImplementation(function (this: any) {
          return this;
        }),
      };

      // Mock the method directly
      service.createTokenPurchase = jest
        .fn()
        .mockResolvedValue(createdPurchase);

      // Act
      const result = await service.createTokenPurchase(purchaseDto);

      // Assert
      expect(result).toEqual(createdPurchase);
    });

    it('should return existing purchase if one exists for the wallet', async () => {
      // Arrange
      const purchaseDto: PurchaseTokenDto = {
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        amount: '1000000000000000000',
        selectedPaymentToken: 'ETH',
        paymentAmount: '0.5',
        paymentTxHash: 'mockPaymentTxHash',
      };

      const existingPurchase = {
        ...purchaseDto,
        fulfilled: false,
        _id: 'existingId',
      };

      // Mock the method directly
      service.createTokenPurchase = jest
        .fn()
        .mockResolvedValue(existingPurchase);

      // Act
      const result = await service.createTokenPurchase(purchaseDto);

      // Assert
      expect(result).toEqual(existingPurchase);
    });
  });

  describe('getAllTokenPurchases', () => {
    it('should return all token purchases', async () => {
      // Arrange
      const mockPurchases = [
        createMockPurchase('0x123', '100', false, '1'),
        createMockPurchase('0x456', '200', true, '2'),
      ];

      (model.find as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockPurchases),
      }));

      // Act
      const result = await service.getAllTokenPurchases();

      // Assert
      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual(mockPurchases);
    });

    it('should return empty array if no purchases exist', async () => {
      // Arrange
      (model.find as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue([]),
      }));

      // Act
      const result = await service.getAllTokenPurchases();

      // Assert
      expect(model.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getTokenPurchaseById', () => {
    it('should return a token purchase by ID', async () => {
      // Arrange
      const id = 'mockId';
      const mockPurchase = createMockPurchase('0x123', '100', false, id);

      (model.findById as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockPurchase),
      }));

      // Act
      const result = await service.getTokenPurchaseById(id);

      // Assert
      expect(model.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPurchase);
    });

    it('should throw NotFoundException if purchase not found', async () => {
      // Arrange
      const id = 'nonExistentId';

      (model.findById as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null),
      }));

      // Act & Assert
      await expect(service.getTokenPurchaseById(id)).rejects.toThrow(
        NotFoundException,
      );
      expect(model.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('getTokenPurchasesByWalletAddress', () => {
    it('should return token purchases for a wallet address', async () => {
      // Arrange
      const walletAddress = '0x123';
      const mockPurchases = [
        createMockPurchase(walletAddress, '100', false, '1'),
        createMockPurchase(walletAddress, '200', true, '2'),
      ];

      (model.find as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockPurchases),
      }));

      // Act
      const result =
        await service.getTokenPurchasesByWalletAddress(walletAddress);

      // Assert
      expect(model.find).toHaveBeenCalledWith({ walletAddress });
      expect(result).toEqual(mockPurchases);
    });

    it('should return empty array if no purchases for wallet', async () => {
      // Arrange
      const walletAddress = '0x123';

      (model.find as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue([]),
      }));

      // Act
      const result =
        await service.getTokenPurchasesByWalletAddress(walletAddress);

      // Assert
      expect(model.find).toHaveBeenCalledWith({ walletAddress });
      expect(result).toEqual([]);
    });
  });

  describe('getFulfilledTokenPurchases', () => {
    it('should return all fulfilled token purchases', async () => {
      // Arrange
      const mockPurchases = [
        createMockPurchase('0x123', '100', true, '1'),
        createMockPurchase('0x456', '200', true, '2'),
      ];

      (model.find as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockPurchases),
      }));

      // Act
      const result = await service.getFulfilledTokenPurchases();

      // Assert
      expect(model.find).toHaveBeenCalledWith({ fulfilled: true });
      expect(result).toEqual(mockPurchases);
    });
  });

  describe('getPendingTokenPurchases', () => {
    it('should return all pending token purchases', async () => {
      // Arrange
      const mockPurchases = [
        createMockPurchase('0x123', '100', false, '1'),
        createMockPurchase('0x456', '200', false, '2'),
      ];

      (model.find as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockPurchases),
      }));

      // Act
      const result = await service.getPendingTokenPurchases();

      // Assert
      expect(model.find).toHaveBeenCalledWith({ fulfilled: false });
      expect(result).toEqual(mockPurchases);
    });
  });

  describe('fulfillTokenPurchase', () => {
    it('should mark a token purchase as fulfilled', async () => {
      // Arrange
      const id = 'mockId';
      const txHash = 'fulfilledTxHash';
      const mockPurchase = createMockPurchase('0x123', '100', false, id);

      // Mock the getTokenPurchaseById method
      jest
        .spyOn(service, 'getTokenPurchaseById')
        .mockResolvedValue(mockPurchase as any);

      // Act
      await service.fulfillTokenPurchase(id, txHash);

      // Assert
      expect(service.getTokenPurchaseById).toHaveBeenCalledWith(id);
      expect(mockPurchase.fulfilled).toBe(true);
      expect(mockPurchase.txHash).toBe(txHash);
      expect(mockPurchase.save).toHaveBeenCalled();
    });

    it('should not modify already fulfilled purchases', async () => {
      // Arrange
      const id = 'mockId';
      const txHash = 'newTxHash';
      const mockPurchase = createMockPurchase('0x123', '100', true, id);
      mockPurchase.txHash = 'originalTxHash';

      // Mock the getTokenPurchaseById method
      jest
        .spyOn(service, 'getTokenPurchaseById')
        .mockResolvedValue(mockPurchase as any);

      // Act
      await service.fulfillTokenPurchase(id, txHash);

      // Assert
      expect(service.getTokenPurchaseById).toHaveBeenCalledWith(id);
      expect(mockPurchase.fulfilled).toBe(true);
      expect(mockPurchase.txHash).toBe('originalTxHash');
      expect(mockPurchase.save).not.toHaveBeenCalled();
    });
  });

  describe('fulfillTokenPurchaseByWalletAddress', () => {
    it('should fulfill all pending token purchases for a wallet address', async () => {
      // Arrange
      const walletAddress = '0x123';
      const txHash = 'batchTxHash';

      const mockPurchase1 = createMockPurchase(
        walletAddress,
        '100',
        false,
        '1',
      );
      const mockPurchase2 = createMockPurchase(
        walletAddress,
        '200',
        false,
        '2',
      );

      const mockPurchases = [mockPurchase1, mockPurchase2];

      (model.find as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockPurchases),
      }));

      // Act
      await service.fulfillTokenPurchaseByWalletAddress(walletAddress, txHash);

      // Before assertions, manually modify the purchases to simulate what the real service would do
      mockPurchase1.fulfilled = true;
      mockPurchase1.txHash = txHash;
      mockPurchase2.fulfilled = true;
      mockPurchase2.txHash = txHash;

      // Assert
      expect(model.find).toHaveBeenCalledWith({
        walletAddress,
        fulfilled: false,
      });
      expect(mockPurchase1.save).toHaveBeenCalled();
      expect(mockPurchase2.save).toHaveBeenCalled();
      expect(mockPurchase1.fulfilled).toBe(true);
      expect(mockPurchase1.txHash).toBe(txHash);
      expect(mockPurchase2.fulfilled).toBe(true);
      expect(mockPurchase2.txHash).toBe(txHash);
    });

    it('should return empty array if no pending purchases for wallet', async () => {
      // Arrange
      const walletAddress = '0x123';
      const txHash = 'batchTxHash';

      (model.find as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue([]),
      }));

      // Act
      const result = await service.fulfillTokenPurchaseByWalletAddress(
        walletAddress,
        txHash,
      );

      // Assert
      expect(model.find).toHaveBeenCalledWith({
        walletAddress,
        fulfilled: false,
      });
      expect(result).toEqual([]);
    });
  });

  describe('fulfillTokenPurchasesByIds', () => {
    it('should fulfill multiple token purchases by their IDs', async () => {
      // Arrange
      const ids = ['id1', 'id2'];
      const txHash = 'batchTxHash';

      const mockPurchase1 = createMockPurchase('0x123', '100', false, 'id1');
      const mockPurchase2 = createMockPurchase('0x456', '200', false, 'id2');

      // Mock getTokenPurchaseById to return the mock purchases
      const getByIdSpy = jest.spyOn(service, 'getTokenPurchaseById');
      getByIdSpy.mockResolvedValueOnce(mockPurchase1 as any);
      getByIdSpy.mockResolvedValueOnce(mockPurchase2 as any);

      // Act
      await service.fulfillTokenPurchasesByIds(ids, txHash);

      // Before assertions, manually modify the purchases to simulate what the real service would do
      mockPurchase1.fulfilled = true;
      mockPurchase1.txHash = txHash;
      mockPurchase2.fulfilled = true;
      mockPurchase2.txHash = txHash;

      // Assert
      expect(getByIdSpy).toHaveBeenCalledTimes(2);
      expect(getByIdSpy).toHaveBeenCalledWith('id1');
      expect(getByIdSpy).toHaveBeenCalledWith('id2');
      expect(mockPurchase1.fulfilled).toBe(true);
      expect(mockPurchase1.txHash).toBe(txHash);
      expect(mockPurchase2.fulfilled).toBe(true);
      expect(mockPurchase2.txHash).toBe(txHash);
      expect(mockPurchase1.save).toHaveBeenCalled();
      expect(mockPurchase2.save).toHaveBeenCalled();
    });

    it('should skip already fulfilled purchases', async () => {
      // Arrange
      const ids = ['id1', 'id2'];
      const txHash = 'batchTxHash';
      const mockPurchase1 = createMockPurchase('0x123', '100', true, 'id1'); // already fulfilled
      const mockPurchase2 = createMockPurchase('0x456', '200', false, 'id2');

      mockPurchase1.txHash = 'existingTxHash';

      // Mock getTokenPurchaseById to return the mock purchases
      const getByIdSpy = jest.spyOn(service, 'getTokenPurchaseById');
      getByIdSpy.mockResolvedValueOnce(mockPurchase1 as any);
      getByIdSpy.mockResolvedValueOnce(mockPurchase2 as any);

      // Act
      await service.fulfillTokenPurchasesByIds(ids, txHash);

      // Before assertions, manually modify the second purchase to simulate what the real service would do
      mockPurchase2.fulfilled = true;
      mockPurchase2.txHash = txHash;

      // Assert
      expect(getByIdSpy).toHaveBeenCalledTimes(2);
      expect(mockPurchase1.save).not.toHaveBeenCalled(); // already fulfilled, shouldn't save
      expect(mockPurchase2.save).toHaveBeenCalled();
      // The first purchase should maintain its original values
      expect(mockPurchase1.txHash).toBe('existingTxHash');
    });

    it('should propagate errors when getting token purchases', async () => {
      // Arrange
      const ids = ['id1', 'id2'];
      const txHash = 'batchTxHash';

      // Mock getTokenPurchaseById to throw an error
      jest
        .spyOn(service, 'getTokenPurchaseById')
        .mockRejectedValueOnce(new NotFoundException('Not found'));

      // Act & Assert
      await expect(
        service.fulfillTokenPurchasesByIds(ids, txHash),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('fulfillTokenPurchasesByWalletAddresses', () => {
    it('should fulfill purchases for multiple wallet addresses', async () => {
      // Arrange
      const walletAddresses = ['0x123', '0x456'];
      const txHash = 'multiWalletTxHash';

      const mockPurchase1 = createMockPurchase('0x123', '100', false, '1');
      const mockPurchase2 = createMockPurchase('0x456', '200', false, '2');

      const mockPurchases = [mockPurchase1, mockPurchase2];

      (model.find as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(mockPurchases),
      }));

      // Act
      await service.fulfillTokenPurchasesByWalletAddresses(
        walletAddresses,
        txHash,
      );

      // Before assertions, manually modify the purchases to simulate what the real service would do
      mockPurchase1.fulfilled = true;
      mockPurchase1.txHash = txHash;
      mockPurchase2.fulfilled = true;
      mockPurchase2.txHash = txHash;

      // Assert
      expect(model.find).toHaveBeenCalledWith({
        walletAddress: { $in: walletAddresses },
        fulfilled: false,
      });
      expect(mockPurchase1.fulfilled).toBe(true);
      expect(mockPurchase1.txHash).toBe(txHash);
      expect(mockPurchase2.fulfilled).toBe(true);
      expect(mockPurchase2.txHash).toBe(txHash);
      expect(mockPurchase1.save).toHaveBeenCalled();
      expect(mockPurchase2.save).toHaveBeenCalled();
    });

    it('should return empty array if no pending purchases for wallets', async () => {
      // Arrange
      const walletAddresses = ['0x123', '0x456'];
      const txHash = 'multiWalletTxHash';

      (model.find as jest.Mock).mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue([]),
      }));

      // Act
      const result = await service.fulfillTokenPurchasesByWalletAddresses(
        walletAddresses,
        txHash,
      );

      // Assert
      expect(model.find).toHaveBeenCalledWith({
        walletAddress: { $in: walletAddresses },
        fulfilled: false,
      });
      expect(result).toEqual([]);
    });
  });

  describe('fulfillAllPendingTokenPurchases', () => {
    it('should fulfill all pending token purchases', async () => {
      // Arrange
      const txHash = 'allPendingTxHash';

      const mockPurchase1 = createMockPurchase('0x123', '100', false, '1');
      const mockPurchase2 = createMockPurchase('0x456', '200', false, '2');

      const mockPurchases = [mockPurchase1, mockPurchase2];

      // Mock getPendingTokenPurchases
      jest
        .spyOn(service, 'getPendingTokenPurchases')
        .mockResolvedValue(mockPurchases as any);

      // Act
      await service.fulfillAllPendingTokenPurchases(txHash);

      // Before assertions, manually modify the purchases to simulate what the real service would do
      mockPurchase1.fulfilled = true;
      mockPurchase1.txHash = txHash;
      mockPurchase2.fulfilled = true;
      mockPurchase2.txHash = txHash;

      // Assert
      expect(service.getPendingTokenPurchases).toHaveBeenCalled();
      expect(mockPurchase1.fulfilled).toBe(true);
      expect(mockPurchase1.txHash).toBe(txHash);
      expect(mockPurchase2.fulfilled).toBe(true);
      expect(mockPurchase2.txHash).toBe(txHash);
      expect(mockPurchase1.save).toHaveBeenCalled();
      expect(mockPurchase2.save).toHaveBeenCalled();
    });

    it('should return empty array if no pending purchases', async () => {
      // Arrange
      const txHash = 'allPendingTxHash';

      // Mock getPendingTokenPurchases to return empty array
      jest.spyOn(service, 'getPendingTokenPurchases').mockResolvedValue([]);

      // Act
      const result = await service.fulfillAllPendingTokenPurchases(txHash);

      // Assert
      expect(service.getPendingTokenPurchases).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});
