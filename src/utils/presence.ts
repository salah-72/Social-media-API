import { logger } from '@/lib/winston';
import redisClient from './redis';

export const isUserOnline = async (userId: string): Promise<boolean> => {
  try {
    const socketCount = await redisClient.sCard(`user:sockets:${userId}`);
    return socketCount > 0;
  } catch (err) {
    logger.warn('Redis check failed in isUserOnline', { userId, err });
    return false;
  }
};

export const setLastSeen = async (userId: string): Promise<void> => {
  try {
    await redisClient.set(`lastSeen:${userId}`, Date.now().toString());
  } catch (err) {
    logger.warn('Redis set failed in setLastSeen', { userId, err });
  }
};

export const getLastSeen = async (userId: string): Promise<Date | null> => {
  try {
    const value = await redisClient.get(`lastSeen:${userId}`);
    return value ? new Date(Number(value)) : null;
  } catch (err) {
    logger.warn('Redis get failed in getLastSeen', { userId, err });
    return null;
  }
};
