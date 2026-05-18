const serverless = require('serverless-http');
const { app, seedPlants } = require('../server');
const connectDB = require('../config/db');

// Ensure database is connected before handling the request
let isConnected = false;

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Allow the function to finish even if there are open connections in the event loop
  context.callbackWaitsForEmptyEventLoop = false;

  console.log(`[Netlify Function] Processing ${event.httpMethod} request for ${event.path}`);
  
  // Validate critical environment variables early
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.error(`CRITICAL: Missing environment variables: ${missingVars.join(', ')}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Server environment configuration error',
        missing: missingVars
      })
    };
  }

  if (!isConnected) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      await connectDB();
      console.log('Database connected, seeding plants...');
      await seedPlants();
      isConnected = true;
      console.log('Initialization complete.');
    } catch (err) {
      console.error('CRITICAL: Initialization failed:', err.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          success: false, 
          message: 'Backend initialization failed',
          error: err.message 
        })
      };
    }
  }

  try {
    return await handler(event, context);
  } catch (err) {
    console.error('API Handler Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: 'Internal Server Error',
        error: err.message 
      })
    };
  }
};
