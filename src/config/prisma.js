import { PrismaClient } from '@prisma/client';
import logger from './logger.js';

const prisma = new PrismaClient();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, disconnecting Prisma');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, disconnecting Prisma');
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
