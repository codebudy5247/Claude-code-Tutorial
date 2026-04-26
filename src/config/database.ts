import mongoose from 'mongoose';
import logger from '../utils/logger';
import config from './env';

class Database {
  async connect(uri?: string): Promise<void> {
    const connectionUri = uri || config.get().mongoUri;
    try {
      await mongoose.connect(connectionUri);
      logger.info('Successfully connected to MongoDB with Mongoose', {
        uri: connectionUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') // Hide password in logs
      });
      
      // Connection event handlers
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

    } catch (error) {
      logger.error('Failed to connect to MongoDB', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }

  // For testing - clear all collections
  async clearDatabase(): Promise<void> {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
}

export default new Database();