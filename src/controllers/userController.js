const prisma = require('../utils/prismaClient');
const Response = require('../utils/response');
const fs = require('fs');
const path = require('path');

class UserController {
  // CREATE
  static async createUser(req, res, next) {
    try {
      const { name, email, age, bio } = req.body;

      const user = await prisma.user.create({
        data: {
          name,
          email,
          age: age ? parseInt(age) : null,
          bio
        }
      });

      return Response.success(res, user, 'User berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  }

  // READ ALL dengan pagination
  static async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          skip,
          take: limit,
          include: {
            _count: {
              select: { posts: true, photos: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count()
      ]);

      const totalPages = Math.ceil(total / limit);

      return Response.success(res, {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // READ ONE
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          posts: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          },
          photos: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: { posts: true, photos: true }
          }
        }
      });

      if (!user) {
        return Response.error(res, 'User tidak ditemukan', 404);
      }

      return Response.success(res, user);
    } catch (error) {
      next(error);
    }
  }

  // UPDATE
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, age, bio } = req.body;
      const userId = parseInt(id);

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          age: age ? parseInt(age) : null,
          bio
        }
      });

      return Response.success(res, user, 'User berhasil diupdate');
    } catch (error) {
      next(error);
    }
  }

  // DELETE
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      // Hapus user dan semua relasinya (karena onDelete: Cascade)
      await prisma.user.delete({
        where: { id: userId }
      });

      return Response.success(res, null, 'User berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }

  // UPLOAD PHOTO untuk user
  static async uploadPhoto(req, res, next) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);
      const file = req.file;

      if (!file) {
        return Response.error(res, 'File gambar diperlukan', 400);
      }

      // Cek apakah user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        // Hapus file yang sudah diupload
        fs.unlinkSync(file.path);
        return Response.error(res, 'User tidak ditemukan', 404);
      }

      const photo = await prisma.photo.create({
        data: {
          filename: file.filename,
          path: file.path,
          url: `${req.protocol}://${req.get('host')}/${file.path}`,
          size: file.size,
          mimeType: file.mimetype,
          userId: userId
        }
      });

      return Response.success(res, photo, 'Foto berhasil diupload', 201);
    } catch (error) {
      // Hapus file jika error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }

  // GET semua photos user
  static async getUserPhotos(req, res, next) {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      const photos = await prisma.photo.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' }
      });

      return Response.success(res, photos);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;