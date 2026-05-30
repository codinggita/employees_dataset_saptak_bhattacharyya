const logger = (req, res, next) => {
  console.log(`${req.method} request received at ${req.originalUrl}`);
  next();
};

const requestTime = (req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
};

module.exports = { logger, requestTime };
