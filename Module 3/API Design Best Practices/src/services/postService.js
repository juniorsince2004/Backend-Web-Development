const store = require('../data/postStore');

const DEFAULT_LIMIT = 2;
const MAX_LIMIT = 5;

function parsePositiveInteger(value, name, defaultValue) {
  if (value === undefined) return defaultValue;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    const err = new Error(`Invalid ${name}`);
    err.statusCode = 400;
    err.code = 'INVALID_PAGINATION';
    throw err;
  }

  return parsed;
}

function listPosts(query = {}) {
  const page = parsePositiveInteger(query.page, 'page', 1);
  const requestedLimit = parsePositiveInteger(query.limit, 'limit', DEFAULT_LIMIT);
  const limit = Math.min(requestedLimit, MAX_LIMIT);
  const allPosts = store.getAllPosts();
  const total = allPosts.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  return {
    data: allPosts.slice(offset, offset + limit),
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null
    }
  };
}

function getPost(id) {
  return store.getPostById(id);
}

function createPost(body = {}) {
  return store.createPost({
    title: body.title,
    author: body.author
  });
}

function likePost(id) {
  return store.incrementLikes(id);
}

function explode() {
  const err = new Error('SQLITE_CONSTRAINT in posts table');
  err.statusCode = 500;
  throw err;
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
