import { logger } from '@/lib/winston';
import { createClient } from 'redis';

const client = createClient();
client.on('error', (err) => logger.error('Redis Client Error', err));

(async () => {
  await client.connect();
  logger.info('Connected to Redis');
})();

export default client;
