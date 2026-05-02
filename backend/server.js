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
dotenv.config({ path: '../.env' });

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
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
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

// Apply authLimiter to all authentication-sensitive routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgotpassword', authLimiter);
app.use('/api/auth/me', authLimiter);

// Mount routes
app.use('/api/machines', machineRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/machine-requests', machineRequestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Database Connected Successfully' });
});

app.get('/api', (req, res) => {
  res.json({ success: true, message: 'Welcome to AssetFlow API' });
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

startServer();
