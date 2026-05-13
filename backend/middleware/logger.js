const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Middleware function
const requestLogger = (req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';
  
  // In development, log everything. In production, ignore read-only GET streams to save logs.
  if (!isProd || req.method !== 'GET') {
    logger.info(`${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
      const redactedBody = { ...req.body };
      if (redactedBody.password) redactedBody.password = '****';
      logger.debug('Body:', redactedBody);
    }
  }
  next();
};

module.exports = { requestLogger, logger };
