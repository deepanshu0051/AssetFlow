const logger = (req, res, next) => {
  console.log(`--- [${new Date().toISOString()}] ${req.method} ${req.url} ---`);
  if (req.body && Object.keys(req.body).length > 0) {
    const redactedBody = { ...req.body };
    if (redactedBody.password) redactedBody.password = '****';
  }
  next();
};

module.exports = logger;
