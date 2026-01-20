import app from './app';
import config from './config/config';
import { logger } from './lib/winston';
import http from 'http';
import { initSocket } from './socket';

const server = http.createServer(app);

initSocket(server);

server.listen(config.PORT, () => {
  logger.info(`app is running at port ${config.PORT}`);
});

const handleServerShutdown = async () => {
  try {
    logger.warn('Server SHUTDOWN');
    process.exit(0);
  } catch (err) {
    logger.error('Error during server shutdown', err);
  }
};

process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
