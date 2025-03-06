import rateLimit from "express-rate-limit";

const transformationRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each user to 10 transformations per 15 minutes
    message: {
      status: 'error',
      message: 'Too many transformation requests. Please try again later.'
    },
    standardHeaders: true, 
    legacyHeaders: false,
  });

export default transformationRateLimiter
  