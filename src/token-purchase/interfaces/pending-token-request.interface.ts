/**
 * Interface representing a pending token purchase request
 * Aligned with the TokenPurchase schema
 */
export interface PendingTokenRequest {
  id: string;
  walletAddress: string;
  amount: string;
  selectedPaymentToken: 'ETH' | 'USDT' | 'USDC';
  paymentAmount: string;
  fulfilled: boolean;
  txHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
