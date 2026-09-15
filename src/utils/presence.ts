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

export const getOnlineStatus = async (
  userIds: string[],
): Promise<Map<string, boolean>> => {
  const statusMap = new Map<string, boolean>();
  if (!userIds.length) return statusMap;

  try {
    const pipline = await redisClient.multi();
    userIds.forEach((id) => pipline.sCard(`user:sockets:${id}`));
    const counts = (await pipline.exec()) as unknown as number[];

    userIds.forEach((id, i) => statusMap.set(id, (counts[i] ?? 0) > 0));
  } catch (err) {
    logger.warn('Redis pipeline failed in getOnlineStatuses', { err });
    userIds.forEach((id) => statusMap.set(id, false));
  }

  return statusMap;
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
