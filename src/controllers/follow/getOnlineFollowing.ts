import Follow from '@/models/followModel';
import catchAsync from '@/utils/catchAsync';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import { getOnlineStatuses } from '@/utils/presence';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response } from 'express';

const MAX_FOLLOWINGS_CHECKED = 500;

export const getOnlineFollowing = catchAsync(
  async (req: Request, res: Response) => {
    const followings = await Follow.find({
      follower: req.currentuser?._id,
      status: 'accepted',
    })
      .select('following -_id')
      .limit(MAX_FOLLOWINGS_CHECKED)
      .lean();

    const followingIds = followings.map((f) => f.following.toString());

    if (!followingIds.length)
      return sendResponse(res, 200, { onlineFollowings: [] }, { results: 0 });

    const onlineStatuses = await getOnlineStatuses(followingIds);
    const onlineIds = followingIds.filter((id) => onlineStatuses.get(id));

    if (!onlineIds.length)
      return sendResponse(res, 200, { onlineFollowings: [] }, { results: 0 });

    const users = await getUsersFromCache(onlineIds);
    const onlineFollowings = users.filter(Boolean);

    sendResponse(
      res,
      200,
      { onlineFollowings },
      { results: onlineFollowings.length },
    );
  },
);
