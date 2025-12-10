const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');
const photoRoutes = require('./photoRoutes');

// API Documentation
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Mini Project 2 API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      posts: '/api/posts',
      photos: '/api/photos'
    }
  });
});

// Main routes
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/photos', photoRoutes);

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

module.exports = router;