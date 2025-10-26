import { LoggingDatabaseSchema } from './schema.js';

export class LoggingDatabaseInitializer {
  static async initialize(): Promise<void> {
    try {
      LoggingDatabaseSchema.initialize();
      console.log('✅ Logging database initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing logging database:', error);
      throw error;
    }
  }
}