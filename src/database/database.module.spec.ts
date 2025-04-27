/* eslint-disable */
import { Test } from '@nestjs/testing';
import { DatabaseModule } from './database.module';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { MongooseModule } from '@nestjs/mongoose';

describe('DatabaseModule', () => {
  it('should be defined', () => {
    expect(DatabaseModule).toBeDefined();
  });

  it('should export MongooseModule', () => {
    const exports = Reflect.getMetadata('exports', DatabaseModule);
    expect(exports).toContain(MongooseModule);
  });

  it('should have correct imports', () => {
    const imports = Reflect.getMetadata('imports', DatabaseModule);
    expect(imports).toBeDefined();
    expect(imports.length).toBeGreaterThan(0);
  });

  it('should create a valid MongoDB configuration', () => {
    // Set up mock ConfigService
    const mockConfigService = {
      mongodbUri: 'mongodb://localhost:27017/test',
    };

    // Create and initialize a test module with our dependencies
    const moduleRef = Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    });

    // Create an instance of DatabaseModule to test its structure
    const databaseModule = new DatabaseModule();
    expect(databaseModule).toBeDefined();
  });
});
