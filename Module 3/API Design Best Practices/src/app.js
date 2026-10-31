const express = require('express');
const postRoutes = require('./routes/postRoutes');
const { resetData } = require('./data/postStore');
const controller = require('./controllers/postController');
const http = require('./utils/http');

function createApp() {
  const app = express();
  app.use(express.json());

  app.use('/', postRoutes);

  app.use((req, res) => {
    return http.sendError(res, 404, 'NOT_FOUND', 'The requested route was not found.');
  });

  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    if (err.type === 'entity.parse.failed') {
      return http.sendError(res, 400, 'INVALID_JSON', 'Request body must contain valid JSON.');
    }

    if (err.statusCode === 400) {
      return http.sendError(
        res,
        400,
        err.code || 'BAD_REQUEST',
        err.code === 'INVALID_PAGINATION'
          ? 'Page and limit must be positive integers.'
          : 'The request could not be processed.'
      );
    }

    console.error(err);
    return http.sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected error occurred.');
  });

  return app;
}

if (require.main === module) {
  const app = createApp();
  const port = 3000;
  app.listen(port, () => {
    console.log(`Starter API listening on port ${port}`);
  });
}

module.exports = {
  createApp,
  resetData
};
