const hits = {};

const rateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const currentTime = Date.now();

  if (!hits[ip]) {
    hits[ip] = [];
  }

  hits[ip] = hits[ip].filter(timestamp => currentTime - timestamp < 60000);

  if (hits[ip].length >= 30) {
    return res.status(429).json({ message: 'Too many requests, please try again later' });
  }

  hits[ip].push(currentTime);
  next();
};

module.exports = rateLimit;
