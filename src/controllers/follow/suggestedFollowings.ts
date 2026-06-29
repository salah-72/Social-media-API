import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import { sendResponse } from '@/utils/sendResponse';
import { getUsersFromCache } from '@/utils/getUsersFromCache';

export const suggestedFollowings = catchAsync(
  async (req: Request, res: Response) => {
    const myId = req.currentuser?._id;
    const blockIds = [...(req.blockIds ?? [])];
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $match: {
          status: 'accepted',
          follower: myId,
        },
      },
      {
        $lookup: {
          from: 'follows',
          let: { followingId: '$following' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$follower', '$$followingId'] },
                    { $eq: ['$status', 'accepted'] },
                  ],
                },
              },
            },
          ],
          as: 'theirFollowings',
        },
      },
      { $unwind: '$theirFollowings' },
      {
        $match: {
          'theirFollowings.following': { $nin: [...blockIds, myId] },
        },
      },
      {
        $lookup: {
          from: 'follows',
          let: { suggestedId: '$theirFollowings.following', myId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$follower', '$$myId'] },
                    { $eq: ['$following', '$$suggestedId'] },
                    { $eq: ['$status', 'accepted'] },
                  ],
                },
              },
            },
          ],
          as: 'alreadyFollowing',
        },
      },
      { $match: { alreadyFollowing: { $eq: [] } } },
      { $group: { _id: '$theirFollowings.following' } },
    ];

    const [suggestedFollowings, totalResult] = await Promise.all([
      Follow.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
      Follow.aggregate([...pipeline, { $count: 'total' }]),
    ]);

    const total = totalResult[0]?.total ?? 0;

    const userIds = suggestedFollowings.map((e) => e._id.toString());
    const usersData = await getUsersFromCache(userIds);

    const result = usersData
      .map((userData) => (userData ? { user: userData } : null))
      .filter(Boolean);

    sendResponse(
      res,
      200,
      { suggestedFollowings: result },
      { pagination: { page, limit, total }, results: result.length },
    );
  },
);
