import logger from '../config/logger.js';

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    const statusCode = 400;
    const message = `${field} already exists`;

    logger.warn(`Validation error: ${message}`);
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode
    });
  }

  // Prisma not found error
  if (err.code === 'P2025') {
    const statusCode = 404;
    const message = 'Record not found';

    logger.warn(message);
    return res.status(statusCode).json({
      success: false,
      message,
      statusCode
    });
  }

  // Operational error
  if (err.isOperational) {
    logger.warn(`Operational error: ${err.message}`);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode
    });
  }

  // Unknown error
  logger.error('Unknown error:', err);
  return res.status(err.statusCode).json({
    success: false,
    message: 'Something went wrong',
    statusCode: err.statusCode
  });
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
