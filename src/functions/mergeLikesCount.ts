import redisClient from '@/utils/redis';

export const mergeLikesCount = async (
  items: any[],
  type: 'post' | 'comment' | 'story',
) => {
  const keys = items.map((item) => `likes:${type}:${item._id}`);

  const pendingCounts = keys.length ? await redisClient.mGet(keys) : [];
  return items.map((item, i) => ({
    ...item,
    likesCount: item.likesCount + Number(pendingCounts[i] || 0),
  }));
};
