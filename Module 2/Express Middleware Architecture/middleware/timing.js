/**
 * timing middleware  [mount GLOBALLY in app.js]
 *
 * Logs how many milliseconds the request took once the response finishes.
 */

function timing(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const elapsed = Date.now() - start;
    const id = req.id ? `[${req.id.slice(0, 8)}] ` : '';

    console.log(`${id}${req.method} ${req.path} took ${elapsed}ms`);
  });

  next();
}

module.exports = timing;