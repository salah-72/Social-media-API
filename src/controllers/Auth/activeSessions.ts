import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import Token from '@/models/tokenModel';
import { sendResponse } from '@/utils/sendResponse';

const getActiveSessions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentuser?._id;
    const activeSessions = await Token.find({
      userId,
      revoked: false,
      expiresAt: { $gt: new Date() },
    }).select('-token -revoked -revokedAt -__v');

    sendResponse(res, 200, { activeSessions });
  },
);

export { getActiveSessions };
