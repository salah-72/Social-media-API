import { logger } from '@/lib/winston';
import User, { IUser } from '@/models/userModel';
import redisClient from '@/utils/redis';
import { Types } from 'mongoose';

export type AuthUser = Pick<
  IUser,
  | '_id'
  | 'username'
  | 'profilePhoto'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'emailVerified'
  | 'active'
  | 'banned'
  | 'role'
  | 'public'
>;

const CACHED_FIELDS =
  '_id username profilePhoto firstName lastName email emailVerified active banned role public';

export const invalidateUserCache = async (userId: string | Types.ObjectId) => {
  try {
    await redisClient.del(`user:${userId}`);
  } catch {
    logger.warn('Redis del failed in invalidateUserCache');
  }
};

const fetchAndCacheUsers = async (userIds: string[]): Promise<AuthUser[]> => {
  const users = await User.find({ _id: { $in: userIds } })
    .select(CACHED_FIELDS)
    .lean<AuthUser[]>();

  if (users.length) {
    try {
      const pipeline = redisClient.multi();
      users.forEach((u) => {
        pipeline.set(`user:${u._id}`, JSON.stringify(u), { EX: 24 * 60 * 60 });
      });
      await pipeline.exec();
    } catch {
      logger.warn('Redis pipeline failed in fetchAndCacheUsers');
    }
  }
  return users;
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
    ? await fetchAndCacheUsers(missedIds)
    : [];

  const mongooseMap = new Map(missedUsers.map((u) => [u._id.toString(), u]));
  return userIds.map((id, i) => {
    const raw: AuthUser | null = cachedUsers[i]
      ? JSON.parse(cachedUsers[i]!)
      : (mongooseMap.get(id) ?? null);

    if (!raw || !raw.active || raw.banned) return null;

    return {
      username: raw.username,
      profilePhoto: raw.profilePhoto,
      firstName: raw.firstName,
      lastName: raw.lastName,
    };
  });
};

export const getAuthUser = async (userId: string): Promise<AuthUser | null> => {
  try {
    const cached = await redisClient.get(`user:${userId}`);

    if (cached) return JSON.parse(cached) as AuthUser;
  } catch {
    logger.warn('Redis get failed in getAuthUser');
  }

  const [user] = await fetchAndCacheUsers([userId]);
  return user ?? null;
};
