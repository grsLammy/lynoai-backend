import { DocumentBuilder } from '@nestjs/swagger';

/**
 * Swagger API documentation text
 */
export const SWAGGER_API_DESCRIPTION = `
## Overview

The LynoAI API provides a robust and secure backend for managing token purchases, database operations, and API interactions for the LynoAI platform.

## Key API Sections

### Token Purchase System

- **$LYNO Token Acquisition**
  - Purchase tokens using different payment tokens (ETH, USDT, USDC)
  - Secure wallet address validation
  - Transaction tracking with MongoDB
  - Transaction fulfillment with blockchain transaction hash validation

- **Admin Management**
  - Comprehensive transaction records
  - Token fulfillment functionality via secure API
  - Complete purchase history tracking

### MongoDB Integration

- Mongoose ORM for MongoDB interaction
- Type-safe schemas and models
- Asynchronous database connection handling

### Additional Features

- Detailed logging and monitoring
- Modular architecture with NestJS
- Comprehensive test coverage
- Well-organized API documentation with Swagger

## API Endpoints

Explore the token purchase endpoints in the sections below to create token purchase requests, retrieve purchase information, and manage token fulfillment.

## Common Response Codes

- **200 OK**: Request successful
- **201 Created**: Resource successfully created
- **400 Bad Request**: Validation error or missing required fields
- **404 Not Found**: Requested resource not found
- **500 Internal Server Error**: Server-side error

For detailed endpoint documentation, see the specific API routes below.
`;

/**
 * Creates and configures the Swagger document builder
 * @returns Configured DocumentBuilder instance
 */
export function createSwaggerConfig(): DocumentBuilder {
  return new DocumentBuilder()
    .setTitle('LynoAI API')
    .setDescription(SWAGGER_API_DESCRIPTION)
    .setVersion('1.0')
    .addTag(
      'token-purchase',
      'Token purchase endpoints for buying $LYNO tokens using ETH, USDT, or USDC',
    )
    .addTag(
      'health',
      'Health check endpoint to verify the API is running correctly',
    );
}
