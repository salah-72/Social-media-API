import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import { sendResponse } from '@/utils/sendResponse';
import { fetchPaginatedUserList } from '@/utils/paginatedUserList';

export const getUserFollowings = catchAsync(
  async (req: Request, res: Response) => {
    const blockIds = [...(req.blockIds ?? [])];

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const { items: followingsData, total } = await fetchPaginatedUserList({
      model: Follow,
      filter: {
        follower: req.targetUser?._id,
        following: { $nin: blockIds },
        status: 'accepted',
      },
      userField: 'following',
      select: 'following -_id',
      page,
      limit,
    });

    sendResponse(
      res,
      200,
      { followingsData },
      { pagination: { page, limit, total }, results: followingsData.length },
    );
  },
);
