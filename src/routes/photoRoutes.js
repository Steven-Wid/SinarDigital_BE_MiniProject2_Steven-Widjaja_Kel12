const express = require('express');
const router = express.Router();
const PhotoController = require('../controllers/photoController');
const { uploadSingle } = require('../middlewares/upload');

// GET all photos
router.get('/', PhotoController.getAllPhotos);

// GET photo by ID
router.get('/:id', PhotoController.getPhotoById);

// UPDATE photo (ganti gambar)
router.put('/:id', uploadSingle('image'), PhotoController.updatePhoto);

// DELETE photo
router.delete('/:id', PhotoController.deletePhoto);

// Serve image file
router.get('/file/:filename', PhotoController.serveImage);

module.exports = router;