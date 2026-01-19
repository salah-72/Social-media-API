import cloudinary from '@/config/cloudinaryConfig';
import { logger } from '@/lib/winston';
import Like from '@/models/likeModel';
import Story from '@/models/storyModel';
import View from '@/models/viewModel';
import cron from 'node-cron';

cron.schedule('*/5 * * * *', async () => {
  try {
    const expiredStories = await Story.find({
      createdAt: { $lt: new Date(Date.now() - 86400000) },
    }).select('_id img');

    if (!expiredStories.length) return;
    const ids = expiredStories.map((e) => e._id);

    await Promise.all([
      Story.deleteMany({ _id: { $in: ids } }),
      Like.deleteMany({ story: { $in: ids } }),
      View.deleteMany({ story: { $in: ids } }),
    ]);

    await Promise.all(
      expiredStories
        .filter((e) => e.img?.publicId)
        .map((e) => cloudinary.uploader.destroy(e.img!.publicId)),
    );

    logger.info(`${expiredStories.length} story is deleted`);
  } catch (err: any) {
    logger.error(err.message);
  }
});
