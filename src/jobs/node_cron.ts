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
  await syncEntity('post', Post);
  await syncEntity('comment', Comment);
  await syncEntity('story', Story);
});

async function syncEntity(type: string, model: any) {
  const syncKey = `sync:likes:${type}`;
  const ids = await redisClient.sMembers(syncKey);
  if (!ids.length) return;

  const bulkOps: any[] = [];
  const processedKeys: string[] = [];

  for (const id of ids) {
    const key = `likes:${type}:${id}`;
    const rawValue = await redisClient.getDel(key);

    if (rawValue === null) {
      await redisClient.sRem(syncKey, id);
      continue;
    }

    const count = parseInt(rawValue, 10);
    if (isNaN(count) || count === 0) continue;

    bulkOps.push({
      updateOne: {
        filter: { _id: id },
        update: { $inc: { likesCount: count } },
      },
    });

    processedKeys.push(id);
  }

  if (!bulkOps.length) return;

  try {
    await model.bulkWrite(bulkOps);
    if (processedKeys.length > 0) {
      await redisClient.sRem(syncKey, processedKeys);
    }
    logger.info(`Synced ${bulkOps.length} ${type} likes successfully`);
  } catch (err: any) {
    logger.error(`Error syncing ${type} likes: ${err.message}`);

    const pipeline = redisClient.multi();
    bulkOps.forEach((op) => {
      const id = op.updateOne.filter._id;
      const count = op.updateOne.update.$inc.likesCount;
      pipeline.incrBy(`likes:${type}:${id}`, count);
      pipeline.sAdd(syncKey, id);
    });
    await pipeline.exec();
    logger.info(`Rolled back ${bulkOps.length} ${type} likes to Redis`);
  }
}
