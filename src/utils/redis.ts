import { logger } from '@/lib/winston';
import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

try {
  const parsed = new URL(REDIS_URL);
  if (parsed.protocol !== 'redis:' && parsed.protocol !== 'rediss:') {
    throw new Error(
      `protocol is '${parsed.protocol}', expected 'redis:' or 'rediss:'`,
    );
  }
} catch (err) {
  throw new Error(
    `Invalid REDIS_URL: "${REDIS_URL}" (${err instanceof Error ? err.message : err}). ` +
      `Expected a URL like redis://localhost:6379. ` +
      `Note: redis://redis:6379 (the Docker Compose service name) only works ` +
      `when the app is also running inside Docker - use redis://localhost:6379 ` +
      `when running "npm run dev" directly on the host.`,
  );
}

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
