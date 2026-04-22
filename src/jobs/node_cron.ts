import cloudinary from '@/config/cloudinaryConfig';
import { logger } from '@/lib/winston';
import Like from '@/models/likeModel';
import Story from '@/models/storyModel';
import Token from '@/models/tokenModel';
import View from '@/models/viewModel';
import cron from 'node-cron';

cron.schedule('0 0 * * *', async () => {
  try {
    const expiredStories = await Story.find({
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).select('_id img');

    if (!expiredStories.length) return;
    const ids = expiredStories.map((e) => e._id);

    await Promise.all([
      Story.deleteMany({ _id: { $in: ids } }),
      Like.deleteMany({ story: { $in: ids } }),
      View.deleteMany({ story: { $in: ids } }),
    ]);

    const publicIds: string[] = expiredStories
      .filter((e) => e.img?.publicId)
      .map((e) => e.img!.publicId!);

    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
    }

    logger.info(`${expiredStories.length} story is deleted`);
  } catch (err: any) {
    logger.error(err.message);
  }
});

cron.schedule('0 0 * * *', async () => {
  try {
    const revokedTokens = await Token.deleteMany({
      revoked: true,
      revokedAt: { $lt: new Date() },
    });

    logger.info(`Deleted ${revokedTokens.deletedCount} revoked tokens`);
  } catch (err: any) {
    logger.error(err.message);
  }
});
