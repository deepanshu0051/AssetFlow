const { logger } = require('./logger');

const errorHandler = (err, req, res, next) => {
  // Log the full error for debugging
  logger.error(`${err.name} - ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    logger.debug(err.stack);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(404).json({
      success: false,
      message: `Resource not found with id: ${err.value}`,
      errors: []
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({
      success: false,
      message: `An account with this ${field} already exists.`,
      errors: []
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map(val => ({
      field: val.path,
      message: val.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token. Please log in again.',
      errors: []
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Your session has expired. Please log in again.',
      errors: []
    });
  }

  // Generic server error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    errors: []
  });
};

module.exports = errorHandler;
