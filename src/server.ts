import app from './app';
import config from './config/config';
import { logger } from './lib/winston';
import http from 'http';
import redisClient, { connectRedis, subClient } from './utils/redis';
import { initSocket } from './socket';

const server = http.createServer(app);

const start = async () => {
  try {
    await connectRedis();
    await initSocket(server);
    server.listen(config.PORT, () => {
      logger.info(`app is running at port ${config.PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

const handleServerShutdown = async () => {
  try {
    logger.warn('Server is shutting down...');
    await redisClient.quit();
    await subClient.quit();
    logger.info('Redis connections closed.');

    server.close(() => {
      logger.info('HTTP server closed successfully.');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forcing server shutdown after timeout');
      process.exit(1);
    }, 10000);
  } catch (err) {
    logger.error('Error during server shutdown', err);
    process.exit(1);
  }
};

process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
