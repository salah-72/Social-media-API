import { logger } from '@/lib/winston';
import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({ url: REDIS_URL });
export const subClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => logger.error('Redis Client Error:', err));
redisClient.on('connect', () => logger.info('Redis connected'));

subClient.on('error', (err) =>
  logger.error('Redis Subscription Client Error:', err),
);
subClient.on('connect', () =>
  logger.info('Redis subscription client connected'),
);

export const connectRedis = async () => {
  await Promise.all([redisClient.connect(), subClient.connect()]);
  logger.info('Redis clients connected');
};

export default redisClient;
