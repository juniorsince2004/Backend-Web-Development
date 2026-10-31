const service = require('../services/postService');
const http = require('../utils/http');

function listPosts(req, res) {
  const result = service.listPosts(req.query);
  return http.sendList(res, result.data, result.meta);
}

function getPost(req, res) {
  const post = service.getPost(req.params.id);
  if (!post) {
    return http.sendError(res, 404, 'POST_NOT_FOUND', 'Post was not found.');
  }
  return http.sendData(res, post);
}

function createPost(req, res) {
  const { title, author } = req.body || {};
  if (typeof title !== 'string' || !title.trim() ||
      typeof author !== 'string' || !author.trim()) {
    return http.sendError(res, 400, 'INVALID_POST', 'Both title and author are required.');
  }

  const post = service.createPost({ title: title.trim(), author: author.trim() });
  return http.sendData(res, post, 201);
}

function likePost(req, res) {
  const post = service.likePost(req.params.id);
  if (!post) {
    return http.sendError(res, 404, 'POST_NOT_FOUND', 'Post was not found.');
  }
  return http.sendData(res, post);
}

function explode(req, res, next) {
  try {
    service.explode();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
