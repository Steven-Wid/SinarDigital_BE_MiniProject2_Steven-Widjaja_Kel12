const Response = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Prisma Error
  if (err.code === 'P2002') {
    return Response.error(res, 'Data sudah ada (unique constraint)', 409);
  }
  
  if (err.code === 'P2025') {
    return Response.error(res, 'Data tidak ditemukan', 404);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return Response.error(res, message, statusCode);
};

module.exports = errorHandler;