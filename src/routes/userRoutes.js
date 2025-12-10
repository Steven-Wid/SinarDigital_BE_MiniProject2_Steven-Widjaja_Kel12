const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { uploadSingle } = require('../middlewares/upload');
const { validate, userValidationRules } = require('../middlewares/validator');

// GET all users
router.get('/', UserController.getAllUsers);

// GET user by ID
router.get('/:id', UserController.getUserById);

// CREATE user
router.post('/', validate(userValidationRules()), UserController.createUser);

// UPDATE user
router.put('/:id', validate(userValidationRules()), UserController.updateUser);

// DELETE user
router.delete('/:id', UserController.deleteUser);

// UPLOAD photo untuk user
router.post('/:id/upload', uploadSingle('image'), UserController.uploadPhoto);

// GET photos user
router.get('/:id/photos', UserController.getUserPhotos);

module.exports = router;