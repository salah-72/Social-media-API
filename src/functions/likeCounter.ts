import redisClient from '@/utils/redis';

export const incrementLike = (type: string, id: string) => {
  redisClient.incrBy(`likes:${type}:${id}`, 1);
};

export const decrementLike = (type: string, id: string) => {
  redisClient.decrBy(`likes:${type}:${id}`, 1);
};
