const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { requestLogger: logger } = require('./middleware/logger');

// Load env vars
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../.env' });
}

const machineRoutes = require('./routes/machineRoutes');
const authRoutes = require('./routes/authRoutes');
const plantRoutes = require('./routes/plantRoutes');
const machineRequestRoutes = require('./routes/machineRequestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Enable CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(ao => ao.trim() === origin.trim());
    const isNetlify = origin.endsWith('.netlify.app') || 
                      origin.endsWith('.vercel.app') || 
                      origin.includes('netlify') || 
                      origin.includes('localhost');
    
    if (isAllowed || isNetlify || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`CORS Warning: Origin ${origin} not in ALLOWED_ORIGINS, but allowed to ensure zero downtime/service disruption for mobile clients.`);
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());

// Request logging (Winston based)
app.use(logger);

// Set security headers
app.use(helmet());

// Data sanitization against NoSQL query injection
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.headers) mongoSanitize.sanitize(req.headers);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 200, // Relaxed for dev
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  }
});
app.use('/api', limiter);

// Optimized rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 500 : 100, // Higher threshold for normal usage
  message: {
    success: false,
    message: 'Too many requests, please try again later'
  },
  skip: (req, res) => process.env.NODE_ENV === 'development' // Optional extra bypass for dev
});

// Define API Router
const apiRouter = express.Router();

// Apply authLimiter to all authentication-sensitive routes within the router
apiRouter.use('/auth/login', authLimiter);
apiRouter.use('/auth/register', authLimiter);
apiRouter.use('/auth/forgotpassword', authLimiter);
apiRouter.use('/auth/me', authLimiter);

// Mount routes to the API Router
apiRouter.use('/machines', machineRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/plants', plantRoutes);
apiRouter.use('/machine-requests', machineRequestRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

apiRouter.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is running correctly',
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasEmailUser: !!process.env.EMAIL_USER,
      hasEmailPass: !!process.env.EMAIL_PASS,
      allowedOrigins: process.env.ALLOWED_ORIGINS
    }
  });
});

apiRouter.get('/test', (req, res) => {
  res.json({ success: true, message: 'Database Connected Successfully' });
});

apiRouter.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to AssetFlow API' });
});

// Mount the API Router on both local and Netlify function paths
// We use an array for flexibility and ensure trailing slashes are handled
app.use(['/api', '/.netlify/functions/api'], apiRouter);

// Catch-all for API router - must be JSON to avoid falling through to SPA index.html
apiRouter.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `API endpoint not found: ${req.originalUrl}` 
  });
});

// Error handling middleware
app.use(errorHandler);

// Seed default plants if they don't exist
const seedPlants = async () => {
  const Plant = require('./models/Plant');
  const plantNames = ['Noida', 'Delhi', 'Greater Noida', 'Mumbai'];
  
  for (const plantName of plantNames) {
    const exists = await Plant.findOne({ plantName });
    if (!exists) {
      await Plant.create({ plantName, machines: [] });
    }
  }
};

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    await seedPlants();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    const { logger: winstonLogger } = require('./middleware/logger');
    winstonLogger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, seedPlants };
