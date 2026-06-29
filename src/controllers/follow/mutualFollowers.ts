import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import { sendResponse } from '@/utils/sendResponse';
import { getUsersFromCache } from '@/utils/getUsersFromCache';

export const mutualFollowers = catchAsync(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const matchStage = {
      following: req.targetUser?._id,
      status: 'accepted',
    };

    const lookupStage = {
      $lookup: {
        from: 'follows',
        let: { followerId: '$follower' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$follower', '$$followerId'] },
                  { $eq: ['$following', req.currentuser?._id] },
                  { $eq: ['$status', 'accepted'] },
                ],
              },
            },
          },
        ],
        as: 'isMutual',
      },
    };

    const [mutualFollowers, totalResult] = await Promise.all([
      Follow.aggregate([
        { $match: matchStage },
        lookupStage,
        { $match: { isMutual: { $ne: [] } } },
        { $skip: skip },
        { $limit: limit },
        { $project: { _id: 0, follower: 1 } },
      ]),
      Follow.aggregate([
        { $match: matchStage },
        lookupStage,
        { $match: { isMutual: { $ne: [] } } },
        { $count: 'total' },
      ]),
    ]);

    const total = totalResult[0]?.total ?? 0;

    const userIds = mutualFollowers.map((e) => e.follower.toString());
    const usersData = await getUsersFromCache(userIds);

    const result = usersData
      .map((userData) => (userData ? { user: userData } : null))
      .filter(Boolean);

    sendResponse(
      res,
      200,
      { mutualFollowers: result },
      { pagination: { page, limit, total }, results: result.length },
    );
  },
);
