import express from 'express';
import prisma from '../config/prisma.js';
import redisClient from '../config/redis.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

const router = express.Router();

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts
 *     tags:
 *       - Posts
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get('/', asyncHandler(async (req, res) => {
  const cacheKey = 'posts:all';

  // Try to get from cache
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    logger.debug('Posts retrieved from cache');
    return res.status(200).json({
      success: true,
      data: JSON.parse(cached),
      source: 'cache'
    });
  }

  // Get from database
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // Cache the result
  await redisClient.setEx(cacheKey, 3600, JSON.stringify(posts));

  logger.info('Posts retrieved from database');

  res.status(200).json({
    success: true,
    data: posts,
    source: 'database'
  });
}));

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post details
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cacheKey = `post:${id}`;

  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return res.status(200).json({
      success: true,
      data: JSON.parse(cached),
      source: 'cache'
    });
  }

  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) }
  });

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  await redisClient.setEx(cacheKey, 3600, JSON.stringify(post));

  res.status(200).json({
    success: true,
    data: post,
    source: 'database'
  });
}));

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Post created
 */
router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const { title, content, published } = req.body;

  if (!title || !content) {
    throw new AppError('Title and content are required', 400);
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      published: published || false
    }
  });

  // Invalidate cache
  await redisClient.del('posts:all');

  logger.info('Post created:', { postId: post.id, userId: req.user.id });

  res.status(201).json({
    success: true,
    data: post
  });
}));

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Post updated
 */
router.put('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, published } = req.body;

  const post = await prisma.post.update({
    where: { id: parseInt(id) },
    data: {
      ...(title && { title }),
      ...(content && { content }),
      ...(published !== undefined && { published })
    }
  });

  // Invalidate cache
  await redisClient.del(`post:${id}`);
  await redisClient.del('posts:all');

  logger.info('Post updated:', { postId: post.id, userId: req.user.id });

  res.status(200).json({
    success: true,
    data: post
  });
}));

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post deleted
 */
router.delete('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await prisma.post.delete({
    where: { id: parseInt(id) }
  });

  // Invalidate cache
  await redisClient.del(`post:${id}`);
  await redisClient.del('posts:all');

  logger.info('Post deleted:', { postId: post.id, userId: req.user.id });

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully'
  });
}));

export default router;
