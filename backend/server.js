const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// Security: custom deepSanitize is used for mongo sanitize and xss protection
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

// Load env vars
dotenv.config({ path: '../.env' });

const machineRoutes = require('./routes/machineRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Enable CORS - Must be before routes and other middleware that sends responses
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());

// Request logging
app.use(logger);

// Set security headers
app.use(helmet());

// Security: sanitize request body — creates a NEW object to avoid sealed-property issues
const deepSanitize = (input) => {
  if (!input || typeof input !== 'object') return input;
  const clean = {};
  for (const key of Object.keys(input)) {
    // Drop mongo operator keys
    if (key.startsWith('$') || key.includes('.')) continue;
    const val = input[key];
    if (typeof val === 'string') {
      // Strip HTML tags (XSS protection)
      clean[key] = val.replace(/<[^>]*>?/gm, '');
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = deepSanitize(val);
    } else {
      clean[key] = val;
    }
  }
  return clean;
};

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body);  // Replace body with a fresh clean copy
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

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
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
