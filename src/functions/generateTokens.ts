import jwt from 'jsonwebtoken';
import config from '@/config/config';
import { Types } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';

export interface ICustomJwtPayload extends JwtPayload {
  _id: Types.ObjectId | string;
}

export const generateRefreshToken = (_id: Types.ObjectId | string): string => {
  const payload: ICustomJwtPayload = { _id };
  return jwt.sign(payload, config.JWT_REFRESH_KEY, {
    expiresIn: config.JWT_REFRESH_EXPIRED_IN,
  });
};

export const generateAccessToken = (_id: Types.ObjectId | string): string => {
  const payload: ICustomJwtPayload = { _id };
  return jwt.sign(payload, config.JWT_ACCESS_KEY, {
    expiresIn: config.JWT_ACCESS_EXPIRED_IN,
  });
};
