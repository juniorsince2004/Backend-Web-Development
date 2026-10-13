/**
 * Central configuration — the ONLY file in the project that reads process.env.
 *
 * Everything else does `const config = require('./config')` (adjust the path)
 * and reads a property. To add a setting: read it here, then document it in
 * .env.example.
 *
 * Defaults (||) are only given for values that are safe to omit in development.
 * jwtSecret has no default on purpose: a made-up secret would be a security hole.
 */
const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  maxArticles: parseInt(process.env.MAX_ARTICLES, 10) || 50,
};

module.exports = Object.freeze(config);
