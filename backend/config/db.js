const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');


let mongoServer;

const { logger } = require('../middleware/logger');

const connectDB = async () => {
  const maxRetries = 3;
  let retries = 0;

  // If in production, we strongly prefer Atlas
  const isProduction = process.env.NODE_ENV === 'production';

  while (retries < maxRetries) {
    try {
      // Use a timeout to avoid hanging if the IP is not whitelisted
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      });
      logger.info('MongoDB Atlas Connected successfully');
      return;
    } catch (error) {
      retries++;
      logger.error(`Atlas Connection Attempt ${retries} failed: ${error.message}`);
      
      if (error.message.includes('SSL') || error.message.includes('serverSelectionTimeout')) {
        if (retries === 1) {
          logger.warn('TIP: If you are seeing SSL or timeout errors, ensure your current IP is whitelisted in MongoDB Atlas dashboard.');
        }
      }

      if (retries >= maxRetries) {
        if (!isProduction) {
          logger.info('Falling back to Local Mock Database (MongoMemoryServer)...');
          try {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
            logger.info('Connected to Local Mock Database');
            return;
          } catch (fallbackError) {
            logger.error(`Failed to start Local Mock Database: ${fallbackError.message}`);
            process.exit(1);
          }
        } else {
          logger.error('Max retries reached in Production. Exiting.');
          process.exit(1);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
};

module.exports = connectDB;
