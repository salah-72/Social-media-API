import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import { sendResponse } from '@/utils/sendResponse';
import { fetchPaginatedUserList } from '@/utils/paginatedUserList';

export const getUserFollowers = catchAsync(
  async (req: Request, res: Response) => {
    const blockIds = [...(req.blockIds ?? [])];

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const { items: followersData, total } = await fetchPaginatedUserList({
      model: Follow,
      filter: {
        following: req.targetUser?._id,
        follower: { $nin: blockIds },
        status: 'accepted',
      },
      userField: 'follower',
      select: 'follower -_id',
      page,
      limit,
    });

    sendResponse(
      res,
      200,
      { followersData },
      { pagination: { page, limit, total }, results: followersData.length },
    );
  },
);
