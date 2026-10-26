const cookieConfig = require('../cookieConfig');
const users = require('../db/userRepository');
const sessions = require('../session/sessionStore');

module.exports = async function requireSession(req, res, next) {
  const sessionId = req.signedCookies[cookieConfig.name];
  if (typeof sessionId !== 'string') {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
    });
  }

  try {
    const session = sessions.get(sessionId);
    if (!session) {
      return res.status(401).json({
        error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
      });
    }

    const user = await users.findPublicById(session.userId);
    if (!user) {
      sessions.destroy(sessionId);
      return res.status(401).json({
        error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
