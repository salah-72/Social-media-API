import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import redisClient from '@/utils/redis';
import { Types } from 'mongoose';

export const invalidateUserCache = async (userId: string | Types.ObjectId) => {
  try {
    await redisClient.del(`user:${userId}`);
  } catch {
    logger.warn('Redis del failed in invalidateUserCache');
  }
};

export const getUsersFromCache = async (userIds: string[]) => {
  const cacheKeys = userIds.map((id) => `user:${id}`);

  let cachedUsers: (string | null)[] = [];
  try {
    cachedUsers = cacheKeys.length ? await redisClient.mGet(cacheKeys) : [];
  } catch {
    logger.warn('Redis mGet failed in getUsersFromCache');
  }
  const missedIds = userIds.filter((_, i) => !cachedUsers[i]);
  const missedUsers = missedIds.length
    ? await User.find({ _id: { $in: missedIds }, active: true })
        .select('username profilePhoto firstName lastName')
        .lean()
    : [];

  if (missedUsers.length) {
    try {
      const pipeline = redisClient.multi();
      missedUsers.forEach((u) => {
        pipeline.set(
          `user:${u._id}`,
          JSON.stringify({
            username: u.username,
            profilePhoto: u.profilePhoto,
            firstName: u.firstName,
            lastName: u.lastName,
          }),
          { EX: 24 * 60 * 60 },
        );
      });
      await pipeline.exec();
    } catch {
      logger.warn('Redis pipeline failed in getUsersFromCache');
    }
  }
  const mongooseMap = new Map(missedUsers.map((u) => [u._id.toString(), u]));
  return userIds.map((id, i) =>
    cachedUsers[i]
      ? JSON.parse(cachedUsers[i]!)
      : (mongooseMap.get(id) ?? null),
  );
};
