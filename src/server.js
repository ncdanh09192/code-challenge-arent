import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index.js';
import { httpLogger } from './config/logger.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import logger from './config/logger.js';
import prisma from './config/prisma.js';
import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// HTTP logging
app.use(httpLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Swagger documentation
if (config.swagger.enabled) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      url: '/api-docs/swagger.json'
    }
  }));

  app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);

// Static files for simple UI
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
  res.sendFile(new URL('../public/index.html', import.meta.url).pathname);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = config.app.port;
const HOST = config.app.host;

let server;

export const startServer = async () => {
  try {
    // Connect to Redis
    await connectRedis();

    // Test Prisma connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Prisma connection established');

    // Start server
    server = app.listen(PORT, HOST, () => {
      logger.info(`Server running at http://${HOST}:${PORT}`);
      logger.info(`API Documentation: http://${HOST}:${PORT}/api-docs`);
      logger.info(`Environment: ${config.app.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

export const stopServer = async () => {
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      logger.info('Server stopped');
    }

    await disconnectRedis();
    await prisma.$disconnect();
    logger.info('All connections closed');
  } catch (error) {
    logger.error('Error stopping server:', error);
    throw error;
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await stopServer();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await stopServer();
  process.exit(0);
});

// Start server if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default app;
