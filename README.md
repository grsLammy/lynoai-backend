<div align="center">

# 🚀 LynoAI Backend API

[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red.svg)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.14.0-green.svg)](https://www.mongodb.com)
[![Node.js](https://img.shields.io/badge/Node.js-22.14.0-green.svg)](https://nodejs.org)

**A robust and secure backend API for the LynoAI platform, built with NestJS, TypeScript, and MongoDB.**

</div>

<div align="center">

[📚 Documentation](#-documentation) • [✨ Features](#-features) • [🚀 Getting Started](#-getting-started) • [📝 Environment Setup](#-environment-setup)

</div>

---

## 📚 Documentation

This API provides a robust backend infrastructure for the LynoAI platform with a focus on security, performance, and developer experience.

---

## ✨ Features

### 💎 Token Purchase System

- **$LYNO Token Acquisition**

  - Purchase tokens using different payment tokens (ETH, USDT, USDC)
  - Secure wallet address validation
  - Transaction tracking with MongoDB
  - API for creating, viewing, and managing token purchases
  - Transaction fulfillment with blockchain transaction hash validation

- **Admin Management**
  - Comprehensive transaction records
  - Token fulfillment functionality via secure API
  - Complete purchase history tracking

### 🔄 Modular Architecture

- **NestJS Framework**
  - Well-organized module structure
  - Dependency injection for clean code organization
  - Request validation using DTOs and class-validator
  - Comprehensive test coverage
  - Detailed API documentation with Swagger

### 🔍 Logging and Monitoring

- **Configurable Logging**
  - Multiple log levels (error, warn, log, debug, verbose)
  - Environment-specific logging configuration
  - Request/response logging for debugging

### 🛠 MongoDB Integration

- **Database Configuration**
  - Mongoose ORM for MongoDB interaction
  - Type-safe schemas and models
  - Asynchronous database connection handling

### 🔒 Security

- **Helmet Integration**
  - Content Security Policy protection
  - XSS protection
  - Protection against MIME type sniffing
  - Strict Transport Security (HSTS)
  - Clickjacking protection via frame guard
  - Secure referrer policy

---

## 📊 Project Structure

The project follows a modular architecture with clear separation of concerns:

```bash
src/
├── common/                  # Common utilities, logger, decorators
├── config/                  # Application configuration module
├── database/                # Database connection module
├── token-purchase/          # Token purchase module
│   ├── dto/                 # Data Transfer Objects
│   ├── interfaces/          # TypeScript interfaces
│   ├── schemas/             # MongoDB schemas
│   ├── token-purchase.controller.ts  # API endpoints
│   ├── token-purchase.service.ts     # Business logic
│   ├── token-purchase.module.ts      # Module definition
│   └── *.spec.ts            # Unit and integration tests
└── main.ts                  # Application entry point
```

---

## 📦 Dependencies

### Core Dependencies

- NestJS (^11.0.1) - Progressive Node.js framework
- Mongoose (^8.14.0) - MongoDB object modeling
- class-validator (^0.14.1) - Validation library
- class-transformer (^0.5.1) - Object transformation
- helmet (^8.1.0) - Security middleware
- dotenv (^16.4.7) - Environment variable management

### Development Tools

- TypeScript (^5.7.3)
- Jest (^29.7.0) - Testing framework
- ESLint (^9.18.0) - Linting
- Prettier (^3.4.2) - Code formatting

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v22+)
- pnpm (v10+)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/lynoai-backend.git
   cd lynoai-backend
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:

   ```bash
   pnpm start:dev
   ```

### Testing

This project includes comprehensive test coverage:

```bash
# Run all tests
pnpm test

# Run tests with watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run end-to-end tests
pnpm test:e2e
```

---

## 📝 Environment Setup

Create a `.env` file with the following variables:

```env
# Node Environment
NODE_ENV="development" # Possible values: development, production, test

# Logging Configuration
LOG_LEVEL="debug" # Possible values: error, warn, log, debug, verbose

# Server Configuration
PORT=3001

# MongoDB Connection
MONGODB_URI="mongodb://localhost:27017/lynoai"
# For MongoDB Atlas: mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

## API Documentation

The API documentation is available via Swagger UI when the application is running. Navigate to:

```bash
http://localhost:3001/api
```

## Token Purchase Endpoints

| Method | Endpoint                    | Description                         |
| ------ | --------------------------- | ----------------------------------- |
| POST   | /token-purchase             | Create a new token purchase request |
| GET    | /token-purchase             | Get all token purchases             |
| GET    | /token-purchase/:id         | Get a token purchase by ID          |
| PUT    | /token-purchase/:id/fulfill | Mark a token purchase as fulfilled  |

## License

This project is licensed under the [MIT License](LICENSE).
