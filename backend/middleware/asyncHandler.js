const { logger } = require('./logger');

const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch((err) => {
    logger.error(`[asyncHandler] Caught error: ${err.name} - ${err.message}`);
    next(err);
  });
};

module.exports = asyncHandler;
