import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEthereumAddress,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

/**
 * DTO for fulfilling a token purchase with transaction hash
 */
export class FulfillTokenPurchaseDto {
  @ApiProperty({
    description: 'Transaction hash from the blockchain',
    example:
      '0x4f9cdc85efc39d3ffcf9b659a1cb2c4c5605dde0dbc97a8e02dfc69558cad94b',
  })
  @IsString()
  @IsNotEmpty()
  txHash: string;
}

/**
 * DTO for fulfilling all token purchases by wallet address
 */
export class FulfillByWalletAddressDto extends FulfillTokenPurchaseDto {
  @ApiProperty({
    description: 'Ethereum wallet address to fulfill purchases for',
    example: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  })
  @IsEthereumAddress()
  @IsNotEmpty()
  walletAddress: string;
}

/**
 * DTO for fulfilling token purchases by batch IDs
 */
export class FulfillByIdsDto extends FulfillTokenPurchaseDto {
  @ApiProperty({
    description: 'Array of token purchase IDs to fulfill',
    example: ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  ids: string[];
}

/**
 * DTO for fulfilling token purchases by batch wallet addresses
 */
export class FulfillByWalletAddressesDto extends FulfillTokenPurchaseDto {
  @ApiProperty({
    description: 'Array of wallet addresses to fulfill purchases for',
    example: [
      '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEthereumAddress({ each: true })
  @IsNotEmpty({ each: true })
  walletAddresses: string[];
}

/**
 * DTO for fulfilling all pending token purchases
 */
export class FulfillAllPendingDto extends FulfillTokenPurchaseDto {
  // Only requires txHash which is inherited from FulfillTokenPurchaseDto
}
