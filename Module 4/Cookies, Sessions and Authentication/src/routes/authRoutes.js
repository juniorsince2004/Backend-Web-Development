const crypto = require('node:crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const cookieConfig = require('../cookieConfig');
const users = require('../db/userRepository');
const sessions = require('../session/sessionStore');
const requireSession = require('../middleware/requireSession');

const router = express.Router();
const invalidCredentials = {
  error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
};

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    normalizedEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
    password.length === 0
  ) {
    return res.status(400).json({
      error: { code: 'INVALID_INPUT', message: 'A valid email and password are required' },
    });
  }

  try {
    const user = await users.findForAuthentication(normalizedEmail);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json(invalidCredentials);
    }

    const sessionId = crypto.randomBytes(32).toString('hex');
    sessions.create(sessionId, user.id);
    res.cookie(cookieConfig.name, sessionId, cookieConfig.options);
    return res.status(200).json({ user: users.toPublicUser(user) });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', requireSession, (req, res) => {
  res.status(200).json({ user: req.user });
});

router.post('/logout', (req, res, next) => {
  try {
    const sessionId = req.signedCookies[cookieConfig.name];
    if (sessionId) sessions.destroy(sessionId);
    res.clearCookie(cookieConfig.name, cookieConfig.options);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
