import dotenv from 'dotenv';
import ms from 'ms';

dotenv.config();

const config = {
  PORT: process.env.PORT || 3000,
  DB_CONNECTION: process.env.DB_CONNECTION,
  LOG_LEVEL: process.env.LOG_LEVEL,
  NODE_ENV: process.env.NODE_ENV,
  JWT_REFRESH_KEY: process.env.JWT_REFRESH_KEY!,
  JWT_ACCESS_KEY: process.env.JWT_ACCESS_KEY!,
  JWT_REFRESH_EXPIRED_IN: process.env.JWT_REFRESH_EXPIRED_IN as ms.StringValue,
  JWT_ACCESS_EXPIRED_IN: process.env.JWT_ACCESS_EXPIRED_IN as ms.StringValue,
  GOOGLE_PASSWORD: process.env.GOOGLE_PASSWORD,
  GOOGLE_USER: process.env.GOOGLE_USER,
  ClientID: process.env.ClientID,
  clientSecret: process.env.clientSecret,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_API_NAME: process.env.CLOUDINARY_API_NAME,
};

export default config;
