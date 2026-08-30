import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import Token from '@/models/tokenModel';
import config from '@/config/config';
import { invalidateUserCache } from '@/utils/getUsersFromCache';
import catchAsync from '@/utils/catchAsync';
import { Request, Response } from 'express';
import { blacklistToken } from '@/utils/tokenBlacklist';

export const deleteMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.currentuser?._id;
  const accessToken = req.headers.authorization?.split(' ')[1];

  await User.updateOne({ _id: userId }, { active: false });
  if (userId) await invalidateUserCache(userId);

  await Token.updateMany(
    { userId, revoked: false },
    { revoked: true, revokedAt: new Date() },
  );

  if (accessToken) await blacklistToken(accessToken);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  logger.info('user disactive his account', { id: userId });

  res.status(204).send();
});
