const multer = require('../config/multer');
const Response = require('../utils/response');

const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const upload = multer.single(fieldName);
    
    upload(req, res, function(err) {
      if (err instanceof multer.MulterError) {
        // Error dari multer
        if (err.code === 'LIMIT_FILE_SIZE') {
          return Response.error(res, 'File terlalu besar. Maksimal 5MB', 400);
        }
        return Response.error(res, err.message, 400);
      } else if (err) {
        // Error lainnya
        return Response.error(res, err.message, 400);
      }
      
      // Jika tidak ada file diupload
      if (!req.file && fieldName === 'image') {
        return Response.error(res, 'File gambar diperlukan', 400);
      }
      
      next();
    });
  };
};

module.exports = { uploadSingle };