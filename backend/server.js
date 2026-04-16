const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// Security: custom deepSanitize is used for mongo sanitize and xss protection
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { requestLogger: logger } = require('./middleware/logger');

// Load env vars
dotenv.config({ path: '../.env' });

const machineRoutes = require('./routes/machineRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Enable CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
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
  // Skip req.query as it's a read-only getter in Express 5
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Strict rate limiting for auth routes (Task 1)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 5,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgotpassword', authLimiter);

// Mount routes
app.use('/api/machines', machineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Database Connected Successfully' });
});

app.get('/api', (req, res) => {
  res.json({ success: true, message: 'Welcome to AssetFlow API' });
});

// Error handling middleware
app.use(errorHandler);

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Enforce 3-collection rule and auto-migrate legacy documents safely
    const enforceDatabaseStructure = require('./utils/enforceDatabase');
    await enforceDatabaseStructure();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
    });
  } catch (error) {
    const { logger } = require('./middleware/logger');
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
