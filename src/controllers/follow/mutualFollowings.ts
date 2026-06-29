import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import { sendResponse } from '@/utils/sendResponse';

export const mutualFollowings = catchAsync(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const matchStage = {
      follower: req.targetUser?._id,
      status: 'accepted',
    };

    const lookupStage = {
      $lookup: {
        from: 'follows',
        let: { followingId: '$following' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$follower', req.currentuser?._id] },
                  { $eq: ['$following', '$$followingId'] },
                  { $eq: ['$status', 'accepted'] },
                ],
              },
            },
          },
        ],
        as: 'isMutual',
      },
    };

    const [mutualFollowings, totalResult] = await Promise.all([
      Follow.aggregate([
        { $match: matchStage },
        lookupStage,
        { $match: { isMutual: { $ne: [] } } },
        { $skip: skip },
        { $limit: limit },
        { $project: { following: 1, _id: 0 } },
      ]),
      Follow.aggregate([
        { $match: matchStage },
        lookupStage,
        { $match: { isMutual: { $ne: [] } } },
        { $count: 'total' },
      ]),
    ]);

    const total = totalResult[0]?.total ?? 0;

    const userIds = mutualFollowings.map((e) => e.following.toString());
    const usersData = await getUsersFromCache(userIds);

    const result = usersData
      .map((userData) => (userData ? { user: userData } : null))
      .filter(Boolean);

    sendResponse(
      res,
      200,
      { mutualFollowings: result },
      { pagination: { page, limit, total }, results: result.length },
    );
  },
);
