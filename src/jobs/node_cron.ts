import cloudinary from '@/config/cloudinaryConfig';
import { logger } from '@/lib/winston';
import Like from '@/models/likeModel';
import Story from '@/models/storyModel';
import Token from '@/models/tokenModel';
import View from '@/models/viewModel';
import Comment from '@/models/commentModel';
import cron from 'node-cron';
import redisClient from '@/utils/redis';
import Post from '@/models/postModel';

cron.schedule('0 * * * *', async () => {
  try {
    const batchSize = 100;
    let hasMore = true;
    let totalDeleted = 0;

    while (hasMore) {
      const expiredStories = await Story.find({
        createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      })
        .select('_id img.publicId')
        .limit(batchSize)
        .lean();

      if (expiredStories.length === 0) {
        hasMore = false;
        break;
      }

      const ids = expiredStories.map((e) => e._id);

      const publicIds = expiredStories
        .map((s) => s.img?.publicId)
        .filter((id): id is string => Boolean(id));

      if (publicIds.length > 0)
        await cloudinary.api.delete_resources(publicIds);

      await Promise.all([
        Story.deleteMany({ _id: { $in: ids } }),
        Like.deleteMany({ story: { $in: ids } }),
        View.deleteMany({ story: { $in: ids } }),
      ]);
      totalDeleted += expiredStories.length;

      if (expiredStories.length < batchSize) hasMore = false;
    }

    logger.info(`${totalDeleted} story is deleted`);
  } catch (err: any) {
    logger.error(err.message);
  }
});

cron.schedule('0 0 * * *', async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const revokedTokens = await Token.deleteMany({
      revoked: true,
      revokedAt: { $lt: sevenDaysAgo },
    });

    logger.info(`Deleted ${revokedTokens.deletedCount} revoked tokens`);
  } catch (err: any) {
    logger.error(err.message);
  }
});

cron.schedule('0/10 * * * *', async () => {
  // const keys = await redisClient.keys('likes:*');
  // if (!keys.length) return;

  // const pipeline = redisClient.multi();
  // keys.forEach((key) => pipeline.get(key));
  // const results = await pipeline.exec();

  // for (let i = 0; i < keys.length; i++) {
  //   const [, type, id] = keys[i].split(':');
  //   const count = Number(results[i]);
  //   if (!count) continue;

  //   if (type === 'post')
  //     await Post.updateOne({ _id: id }, { $inc: { likesCount: count } });
  //   else if (type === 'comment')
  //     await Comment.updateOne({ _id: id }, { $inc: { likesCount: count } });
  //   else if (type === 'story')
  //     await Story.updateOne({ _id: id }, { $inc: { likesCount: count } });

  //   await redisClient.del(keys[i]);
  // }

  await syncEntity('post', Post);
  await syncEntity('comment', Comment);
  await syncEntity('story', Story);
});

async function syncEntity(type: string, model: any) {
  const syncKeys = `sync:likes:${type}`;
  const ids = await redisClient.sMembers(syncKeys);
  if (!ids.length) return;

  const keys = ids.map((id) => `likes:${type}:${id}`);
  const values = await redisClient.mGet(keys);

  const bulkOps: any[] = [];
  for (let i = 0; i < ids.length; i++) {
    const count = Number(values[i]);
    if (count === null || count === undefined) continue;

    bulkOps.push({
      updateOne: {
        filter: { _id: ids[i] },
        update: { $inc: { likesCount: count } },
      },
    });
  }

  if (bulkOps.length > 0) {
    await model.bulkWrite(bulkOps);
    await redisClient.sRem(syncKeys, ids);
    await redisClient.del(keys);
  }
}
