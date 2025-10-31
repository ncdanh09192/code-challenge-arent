import { createClient } from 'redis';
import { config } from './index.js';
import logger from './logger.js';

const client = createClient({
  url: config.redis.url
});

client.on('error', (err) => {
  logger.error('Redis error:', err);
});

client.on('connect', () => {
  logger.info('Redis connected');
});

client.on('reconnecting', () => {
  logger.info('Redis reconnecting');
});

export const connectRedis = async () => {
  try {
    await client.connect();
    logger.info('Redis connection established');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const disconnectRedis = async () => {
  try {
    await client.disconnect();
    logger.info('Redis disconnected');
  } catch (error) {
    logger.error('Failed to disconnect from Redis:', error);
  }
};

export default client;
