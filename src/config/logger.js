import pino from 'pino';
import pinoHttp from 'pino-http';

const logLevel = process.env.LOG_LEVEL || 'debug';
const isDevelopment = process.env.NODE_ENV !== 'production';

const logger = pino({
  level: logLevel,
  ...(isDevelopment && {
    transport: {
      target: 'pino/file',
      options: {
        colorize: true,
        destination: 1,
        mkdir: true
      }
    }
  })
});

export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => {
      return req.url === '/health' || req.url === '/api-docs' || req.url.startsWith('/api-docs/');
    }
  }
});

export default logger;
