const prisma = require('../utils/prismaClient');
const Response = require('../utils/response');
const fs = require('fs');
const path = require('path');

class PostController {
  // CREATE
  static async createPost(req, res, next) {
    try {
      const { title, content, published, userId } = req.body;

      const post = await prisma.post.create({
        data: {
          title,
          content,
          published: published === 'true' || published === true,
          userId: parseInt(userId)
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return Response.success(res, post, 'Post berhasil dibuat', 201);
    } catch (error) {
      next(error);
    }
  }

  // READ ALL dengan pagination & filter
  static async getAllPosts(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const published = req.query.published;
      const skip = (page - 1) * limit;

      const where = {};
      if (published !== undefined) {
        where.published = published === 'true';
      }

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where,
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
            _count: {
              select: { photos: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.post.count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);

      return Response.success(res, {
        posts,
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
  static async getPostById(req, res, next) {
    try {
      const { id } = req.params;
      const postId = parseInt(id);

      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          photos: true,
          _count: {
            select: { photos: true }
          }
        }
      });

      if (!post) {
        return Response.error(res, 'Post tidak ditemukan', 404);
      }

      return Response.success(res, post);
    } catch (error) {
      next(error);
    }
  }

  // UPDATE
  static async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const { title, content, published } = req.body;
      const postId = parseInt(id);

      const post = await prisma.post.update({
        where: { id: postId },
        data: {
          title,
          content,
          published: published === 'true' || published === true
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return Response.success(res, post, 'Post berhasil diupdate');
    } catch (error) {
      next(error);
    }
  }

  // DELETE
  static async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      const postId = parseInt(id);

      await prisma.post.delete({
        where: { id: postId }
      });

      return Response.success(res, null, 'Post berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }

  // UPLOAD PHOTO untuk post
  static async uploadPostPhoto(req, res, next) {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      const file = req.file;

      if (!file) {
        return Response.error(res, 'File gambar diperlukan', 400);
      }

      // Cek apakah post exists
      const post = await prisma.post.findUnique({
        where: { id: postId }
      });

      if (!post) {
        // Hapus file yang sudah diupload
        fs.unlinkSync(file.path);
        return Response.error(res, 'Post tidak ditemukan', 404);
      }

      const photo = await prisma.photo.create({
        data: {
          filename: file.filename,
          path: file.path,
          url: `${req.protocol}://${req.get('host')}/${file.path}`,
          size: file.size,
          mimeType: file.mimetype,
          postId: postId
        }
      });

      return Response.success(res, photo, 'Foto post berhasil diupload', 201);
    } catch (error) {
      // Hapus file jika error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }

  // GET semua photos post
  static async getPostPhotos(req, res, next) {
    try {
      const { id } = req.params;
      const postId = parseInt(id);

      const photos = await prisma.photo.findMany({
        where: { postId: postId },
        orderBy: { createdAt: 'desc' }
      });

      return Response.success(res, photos);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PostController;