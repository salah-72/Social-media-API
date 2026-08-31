import jwt from 'jsonwebtoken';
import redisClient from './redis';
import { logger } from '@/lib/winston';

export const blacklistToken = async (token: string): Promise<void> => {
  try {
    const decoded = jwt.decode(token) as { exp?: number } | null;
    const now = Math.floor(Date.now() / 1000);

    const ttl = decoded?.exp ? decoded.exp - now : 15 * 60;

    if (ttl <= 0) return;

    await redisClient.set(`blacklist:${token}`, '1', { EX: ttl });
  } catch (err) {
    logger.error('Failed to blacklist token', { err });
  }
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  try {
    const exists = await redisClient.exists(`blacklist:${token}`);
    return exists === 1;
  } catch (err) {
    logger.warn('Redis check failed in isTokenBlacklisted', { err });
    return false;
  }
};
