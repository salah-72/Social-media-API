import redisClient from '@/utils/redis';

export const incrementLike = async (type: string, id: string) => {
  const pipeline = redisClient.multi();
  pipeline.incr(`likes:${type}:${id}`);
  pipeline.sAdd(`sync:likes:${type}`, id);
  return await pipeline.exec();
};

export const decrementLike = async (type: string, id: string) => {
  const pipeline = redisClient.multi();
  pipeline.decr(`likes:${type}:${id}`);
  pipeline.sAdd(`sync:likes:${type}`, id);
  return await pipeline.exec();
};
