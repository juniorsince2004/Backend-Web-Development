/**
 * requestId middleware  [mount GLOBALLY in app.js]
 *
 * Generates a UUID, attaches it to req.id, sets the response header, and calls
 * next() so the request continues down the pipeline.
 */

const { randomUUID } = require('crypto');

function requestId(req, res, next) {
  const id = randomUUID();

  req.id = id;
  res.setHeader('X-Request-Id', id);

  next();
}

module.exports = requestId;