const serverless = require('serverless-http');
const app = require('../server');
const connectDB = require('../config/db');

// Ensure database is connected before handling the request
let isConnected = false;

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Allow the function to finish even if there are open connections in the event loop
  context.callbackWaitsForEmptyEventLoop = false;

  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('Database connection error in serverless function:', err);
    }
  }

  return await handler(event, context);
};
