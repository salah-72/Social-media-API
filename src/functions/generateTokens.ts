import jwt from 'jsonwebtoken';
import config from '@/config/config';
import { Types } from 'mongoose';

export const generateRefreshToken = (_id: Types.ObjectId): string => {
  return jwt.sign({ _id }, config.JWT_REFRESH_KEY, {
    expiresIn: config.JWT_REFRESH_EXPIRED_IN,
  });
};

export const generateAccessToken = (_id: Types.ObjectId): string => {
  return jwt.sign({ _id }, config.JWT_ACCESS_KEY, {
    expiresIn: config.JWT_ACCESS_EXPIRED_IN,
  });
};
