import { logger } from '@/lib/winston';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

const allowedFeilds = [
  'username',
  'firstName',
  'lastName',
  'public',
  'about',
  'hometown',
  'currentCity',
  'education',
  'experience',
  'gender',
  'birthday',
  'socialLinks',
];

const filter = (all: any, allowed: string[]) => {
  const newObj: any = {};
  Object.keys(all).forEach((el) => {
    if (allowed.includes(el)) newObj[el] = all[el];
  });
  return newObj;
};

export const updateProfileInfo = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.password)
      return next(
        new appError(
          'This url is not for update password, if you want to change it go to /updatePassword',
          400,
        ),
      );

    if (req.body.email)
      return next(new appError('you can not change your email', 400));

    const fields = filter(req.body, allowedFeilds);

    const user = await User.findByIdAndUpdate(req.currentuser?._id, fields, {
      new: true,
      runValidators: true,
    });

    logger.info('user updated his profile info', { id: req.currentuser?._id });

    res.status(200).json({
      status: 'success',
      user,
    });
  },
);
