const name = 'sid';
const maxAge = Number(process.env.SESSION_TTL_MS || 60 * 60 * 1000);

if (!Number.isSafeInteger(maxAge) || maxAge <= 0) {
  throw new Error('SESSION_TTL_MS must be a positive integer');
}

const options = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true',
  path: '/',
  maxAge,
  signed: true,
};

module.exports = { name, maxAge, options };
