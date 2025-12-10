const prisma = require('../utils/prismaClient');
const Response = require('../utils/response');
const fs = require('fs');
const path = require('path');

class PhotoController {
  // CREATE (upload langsung di user/post controller)

  // READ ALL
  static async getAllPhotos(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [photos, total] = await Promise.all([
        prisma.photo.findMany({
          skip,
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            post: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.photo.count()
      ]);

      const totalPages = Math.ceil(total / limit);

      return Response.success(res, {
        photos,
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
  static async getPhotoById(req, res, next) {
    try {
      const { id } = req.params;
      const photoId = parseInt(id);

      const photo = await prisma.photo.findUnique({
        where: { id: photoId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          post: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      if (!photo) {
        return Response.error(res, 'Foto tidak ditemukan', 404);
      }

      return Response.success(res, photo);
    } catch (error) {
      next(error);
    }
  }

  // UPDATE (ganti gambar)
  static async updatePhoto(req, res, next) {
    try {
      const { id } = req.params;
      const photoId = parseInt(id);
      const file = req.file;

      if (!file) {
        return Response.error(res, 'File gambar diperlukan', 400);
      }

      // Cari photo existing
      const existingPhoto = await prisma.photo.findUnique({
        where: { id: photoId }
      });

      if (!existingPhoto) {
        // Hapus file baru yang sudah diupload
        fs.unlinkSync(file.path);
        return Response.error(res, 'Foto tidak ditemukan', 404);
      }

      // Hapus file lama jika ada
      if (fs.existsSync(existingPhoto.path)) {
        fs.unlinkSync(existingPhoto.path);
      }

      // Update dengan file baru
      const updatedPhoto = await prisma.photo.update({
        where: { id: photoId },
        data: {
          filename: file.filename,
          path: file.path,
          url: `${req.protocol}://${req.get('host')}/${file.path}`,
          size: file.size,
          mimeType: file.mimetype
        }
      });

      return Response.success(res, updatedPhoto, 'Foto berhasil diupdate');
    } catch (error) {
      // Hapus file baru jika error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }

  // DELETE
  static async deletePhoto(req, res, next) {
    try {
      const { id } = req.params;
      const photoId = parseInt(id);

      // Cari photo untuk mendapatkan path file
      const photo = await prisma.photo.findUnique({
        where: { id: photoId }
      });

      if (!photo) {
        return Response.error(res, 'Foto tidak ditemukan', 404);
      }

      // Hapus dari database
      await prisma.photo.delete({
        where: { id: photoId }
      });

      // Hapus file fisik jika ada
      if (fs.existsSync(photo.path)) {
        fs.unlinkSync(photo.path);
      }

      return Response.success(res, null, 'Foto berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }

  // SERVE IMAGE
  static async serveImage(req, res, next) {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../../uploads', filename);

      if (!fs.existsSync(filePath)) {
        return Response.error(res, 'File tidak ditemukan', 404);
      }

      res.sendFile(filePath);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PhotoController;