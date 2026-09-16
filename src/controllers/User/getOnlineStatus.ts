import catchAsync from '@/utils/catchAsync';
import { getLastSeen, isUserOnline } from '@/utils/presence';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const getOnlineStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const online = await isUserOnline(id);
    const lastseen = online ? null : await getLastSeen(id);

    sendResponse(res, 200, { isOnline: online, lastseen });
  },
);
