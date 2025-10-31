import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export const config = {
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.APP_PORT || 3003,
    host: process.env.APP_HOST || '0.0.0.0'
  },
  database: {
    url: process.env.DATABASE_URL
  },
  redis: {
    url: process.env.REDIS_URL
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    expiresIn: process.env.JWT_EXPIRATION || '7d'
  },
  swagger: {
    enabled: process.env.SWAGGER_ENABLED !== 'false'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'debug'
  }
};

export default config;
