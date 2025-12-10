const express = require('express');
const router = express.Router();
const PostController = require('../controllers/postController');
const { uploadSingle } = require('../middlewares/upload');
const { validate, postValidationRules } = require('../middlewares/validator');

// GET all posts
router.get('/', PostController.getAllPosts);

// GET post by ID
router.get('/:id', PostController.getPostById);

// CREATE post
router.post('/', validate(postValidationRules()), PostController.createPost);

// UPDATE post
router.put('/:id', validate(postValidationRules()), PostController.updatePost);

// DELETE post
router.delete('/:id', PostController.deletePost);

// UPLOAD photo untuk post
router.post('/:id/upload', uploadSingle('image'), PostController.uploadPostPhoto);

// GET photos post
router.get('/:id/photos', PostController.getPostPhotos);

module.exports = router;