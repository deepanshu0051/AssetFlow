const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dns = require('dns');

// Set DNS servers to Google's to help with SRV resolution in some environments
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('Could not set custom DNS servers, using default.');
}

let mongoServer;

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
      return;
    } catch (error) {
      retries++;
      console.error(`Atlas Connection Attempt ${retries} failed: ${error.message}`);
      
      if (retries >= maxRetries) {
        if (!isProduction) {
          
          try {
            mongoServer = await MongoMemoryServer.create();
            const mongoUri = mongoServer.getUri();
            await mongoose.connect(mongoUri);
            return;
          } catch (fallbackError) {
            console.error(`Failed to start Local Mock Database: ${fallbackError.message}`);
            process.exit(1);
          }
        } else {
          console.error('Max retries reached in Production. Exiting.');
          process.exit(1);
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
};

module.exports = connectDB;
