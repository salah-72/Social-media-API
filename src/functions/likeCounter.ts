import redisClient from '@/utils/redis';

export const incrementLike = (type: string, id: string) => {
  const pipeline = redisClient.multi();
  pipeline.incr(`likes:${type}:${id}`);
  pipeline.sAdd(`sync:likes:${type}`, id);
  pipeline.exec();
};

export const decrementLike = (type: string, id: string) => {
  const pipeline = redisClient.multi();
  pipeline.decr(`likes:${type}:${id}`);
  pipeline.sAdd(`sync:likes:${type}`, id);
  pipeline.exec();
};
