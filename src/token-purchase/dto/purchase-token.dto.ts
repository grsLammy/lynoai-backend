import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEthereumAddress, IsIn } from 'class-validator';
import { PaymentTokenType } from '../schemas/token-purchase.schema';

/**
 * Data Transfer Object for token purchase requests
 */
export class PurchaseTokenDto {
  @ApiProperty({
    description: 'Ethereum wallet address to receive tokens',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  walletAddress: string;

  @ApiProperty({
    description: 'Amount of tokens to purchase',
    example: '1000000000000000000', // 1 token with 18 decimals
  })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({
    description: 'Selected payment token',
    example: 'ETH',
    enum: ['ETH', 'USDT', 'USDC'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['ETH', 'USDT', 'USDC'])
  selectedPaymentToken: PaymentTokenType;

  @ApiProperty({
    description: 'Amount of payment token',
    example: '0.5',
  })
  @IsString()
  @IsNotEmpty()
  paymentAmount: string;

  @ApiProperty({
    description: 'Transaction hash of the payment transaction',
    example:
      '0x4f9cdc85efc39d3ffcf9b659a1cb2c4c5605dde0dbc97a8e02dfc69558cad94b',
  })
  @IsString()
  @IsNotEmpty()
  paymentTxHash: string;
}
