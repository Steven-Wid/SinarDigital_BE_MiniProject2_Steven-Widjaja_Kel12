const { body, validationResult } = require('express-validator');
const Response = require('../utils/response');

const validate = (validations) => {
  return async (req, res, next) => {
    // Jalankan validasi
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = {};
    errors.array().forEach(err => {
      if (!extractedErrors[err.path]) {
        extractedErrors[err.path] = [];
      }
      extractedErrors[err.path].push(err.msg);
    });

    return Response.error(res, 'Validasi gagal', 422, extractedErrors);
  };
};

// Validator untuk User
const userValidationRules = () => {
  return [
    body('name')
      .notEmpty().withMessage('Nama diperlukan')
      .isLength({ min: 3 }).withMessage('Nama minimal 3 karakter')
      .trim(),
    body('email')
      .notEmpty().withMessage('Email diperlukan')
      .isEmail().withMessage('Email tidak valid')
      .normalizeEmail(),
    body('age')
      .optional()
      .isInt({ min: 1, max: 150 }).withMessage('Umur harus antara 1-150'),
    body('bio')
      .optional()
      .trim()
  ];
};

// Validator untuk Post
const postValidationRules = () => {
  return [
    body('title')
      .notEmpty().withMessage('Judul diperlukan')
      .isLength({ min: 3, max: 200 }).withMessage('Judul harus 3-200 karakter')
      .trim(),
    body('content')
      .notEmpty().withMessage('Konten diperlukan')
      .isLength({ min: 10 }).withMessage('Konten minimal 10 karakter')
      .trim(),
    body('published')
      .optional()
      .isBoolean().withMessage('Published harus boolean'),
    body('userId')
      .notEmpty().withMessage('User ID diperlukan')
      .isInt().withMessage('User ID harus angka')
  ];
};

module.exports = {
  validate,
  userValidationRules,
  postValidationRules
};