const express = require('express');
const controller = require('../controllers/postController');

const router = express.Router();

router.get('/posts', controller.listPosts);
router.post('/posts', controller.createPost);
router.get('/posts/:id', controller.getPost);
router.post('/posts/:id/likes', controller.likePost);
router.get('/demo/internal-error', controller.explode);

module.exports = router;
