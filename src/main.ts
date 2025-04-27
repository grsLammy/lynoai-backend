import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { createSwaggerConfig } from './config/swagger.config';
import { AppLoggerService } from './common/logger';
import { ConfigService } from './config/config.service';
import helmet from 'helmet';

async function bootstrap() {
  // Create custom logger instance for bootstrap process
  const logger = new AppLoggerService('Bootstrap');
  logger.log('Starting application');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // Buffer logs until custom logger is set
  });

  // Get config service
  const configService = app.get(ConfigService);

  // Use our custom logger for the entire application
  app.useLogger(app.get(AppLoggerService));

  // Apply Helmet middleware for security headers
  app.use(
    helmet({
      // Content Security Policy configuration
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline and eval for Swagger UI
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
          imgSrc: ["'self'", 'data:'], // Allow data: URIs for images
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      // XSS Protection
      xssFilter: true,
      // Prevent MIME type sniffing
      noSniff: true,
      // Strict Transport Security - extend max age to 1 year
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      // Prevent site from being framed (clickjacking protection)
      frameguard: {
        action: 'deny',
      },
      // Referrer policy
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    }),
  );

  // Global validation pipe with sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not defined in DTOs (prevents property injection)
      transform: true, // Transform payloads to DTO instances with correct types
      forbidNonWhitelisted: true, // Throw errors when non-whitelisted properties are present
    }),
  );

  // Enable CORS with explicit configuration for Authorization header
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type,Accept,Authorization',
    exposedHeaders: 'Authorization',
  });

  // Swagger documentation setup
  const config = createSwaggerConfig().build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
    },
    customSiteTitle: 'LynoAI API Documentation',
  });

  await app.listen(configService.port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(
    `Swagger documentation is available at: ${await app.getUrl()}/api/docs`,
  );
  logger.log(`Environment: ${configService.nodeEnv}`);
  logger.log(`Log levels: ${configService.logLevels.join(', ')}`);
}

bootstrap().catch((error: Error) => {
  const logger = new AppLoggerService('Bootstrap');
  logger.error(`Application failed to start: ${error.message}`, error.stack);
  process.exit(1);
});
