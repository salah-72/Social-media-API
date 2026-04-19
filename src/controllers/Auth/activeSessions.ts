import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import Token from '@/models/tokenModel';

const getActiveSessions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentuser?._id;
    const activeSessions = await Token.find({
      userId,
      revoked: false,
      expiresAt: { $gt: new Date() },
    }).select('-token -revoked -revokedAt -__v');
    res.status(200).json({
      status: 'success',
      data: {
        activeSessions,
      },
    });
  },
);

export { getActiveSessions };
