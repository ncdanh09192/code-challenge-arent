import express from 'express';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import logger from '../config/logger.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Mock authentication - In production use actual user verification
  if (email === 'demo@example.com' && password === 'password') {
    const token = generateToken({
      id: 1,
      email: email,
      username: 'demo_user'
    });

    logger.info('User logged in:', { email });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: 1,
        email,
        username: 'demo_user'
      }
    });
  }

  throw new AppError('Invalid email or password', 401);
}));

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify JWT token
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token is valid
 *       401:
 *         description: Invalid or expired token
 */
router.post('/verify', asyncHandler((req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError('Token is required', 400);
  }

  const decoded = verifyToken(token);

  res.status(200).json({
    success: true,
    decoded
  });
}));

export default router;
