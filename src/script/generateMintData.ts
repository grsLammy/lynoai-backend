import { NestFactory } from '@nestjs/core';
import { INestApplicationContext } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../app.module';
import { TokenPurchaseService } from '../token-purchase/token-purchase.service';
import { TokenPurchaseDocument } from '../token-purchase/schemas/token-purchase.schema';

/**
 * Script to generate mint data for pending token purchases
 * This will fetch all pending token purchases and create a JSON file with:
 * - Array of wallet addresses (recipients)
 * - Array of token amounts
 */
async function bootstrap(): Promise<void> {
  console.log('Starting generateMintData script...');

  // Create NestJS application context
  const app: INestApplicationContext =
    await NestFactory.createApplicationContext(AppModule);

  try {
    // Get the TokenPurchaseService from the application context
    const tokenPurchaseService = app.get(TokenPurchaseService);

    console.log('Fetching pending token purchases from database...');

    // Fetch all pending token purchases
    const pendingPurchases: TokenPurchaseDocument[] =
      await tokenPurchaseService.getPendingTokenPurchases();

    console.log(`Found ${pendingPurchases.length} pending token purchases`);

    if (pendingPurchases.length === 0) {
      console.log('No pending purchases found. Exiting...');
      await app.close();
      return;
    }

    // Extract wallet addresses and amounts
    const recipients: string[] = pendingPurchases.map(
      (purchase) => purchase.walletAddress,
    );
    const amounts: string[] = pendingPurchases.map(
      (purchase) => purchase.amount,
    );

    // Create data structure
    const mintData = {
      recipients,
      amounts,
    };

    // Create output directory if it doesn't exist
    const outputDir = path.resolve(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate timestamp for filename
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '');
    const outputPath = path.join(outputDir, `mint-data-${timestamp}.json`);

    // Write the data to a JSON file
    fs.writeFileSync(outputPath, JSON.stringify(mintData, null, 2));

    console.log(`Mint data successfully generated and saved to: ${outputPath}`);

    // Print summary
    console.log('\nSummary:');
    console.log(`Total Recipients: ${recipients.length}`);

    // Calculate total amount (assuming amounts are in wei/smallest unit)
    const totalAmount = amounts.reduce((sum, amount) => {
      return (BigInt(sum) + BigInt(amount)).toString();
    }, '0');

    console.log(`Total Token Amount: ${totalAmount}`);
  } catch (error) {
    console.error('Error generating mint data:', error);
  } finally {
    await app.close();
    console.log('Script completed');
  }
}

// Run the script
bootstrap()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
