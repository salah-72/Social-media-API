import redisClient from '@/utils/redis';

export const mergeLikesCount = async (
  items: any[],
  type: 'post' | 'comment' | 'story',
) => {
  const plainItems = items.map((item) =>
    typeof item.toObject === 'function' ? item.toObject() : item,
  );
  const keys = plainItems.map((item) => `likes:${type}:${item._id}`);

  const pendingCounts = keys.length ? await redisClient.mGet(keys) : [];
  return plainItems.map((item, i) => ({
    ...item,
    likesCount: (item.likesCount ?? 0) + Number(pendingCounts[i] || 0),
  }));
};
