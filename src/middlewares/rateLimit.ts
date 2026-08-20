import redisClient from '@/utils/redis';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skip?: (req: Request) => boolean;
}

const luaRateLimitScript = `
  local current = redis.call("incr", KEYS[1])
  
  if current == 1 then
    redis.call("expire", KEYS[1], ARGV[1])
  end
  
  local ttl = redis.call("ttl", KEYS[1])
  
  if ttl == -1 then
    redis.call("expire", KEYS[1], ARGV[1])
    ttl = tonumber(ARGV[1])
  end
  
  return {current, ttl}
`;

export const rateLimit = (options: RateLimitOptions) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (options.skip?.(req)) return next();

    const windowSec = Math.max(1, Math.floor(options.windowMs / 1000));
    const message =
      options.message || 'Too many requests, please try again later';

    const rawIp = req.ip || 'unknown';

    const identifier = req.currentuser?._id
      ? `user:${req.currentuser._id}`
      : `ip:${rawIp}`;

    const routePath = req.baseUrl + (req.route?.path ?? req.path);
    const key = `ratelimit:${identifier}:${req.method}:${routePath}`;

    let count = 0;
    let ttl = windowSec;

    try {
      const result = (await redisClient.eval(luaRateLimitScript, {
        keys: [key],
        arguments: [windowSec.toString()],
      })) as [number, number];

      count = Number(result[0]);
      ttl = Number(result[1]);
    } catch (err) {
      console.error('Redis Rate Limiter Error:', err);
      return next();
    }

    if (ttl <= 0) ttl = windowSec;

    res.setHeader('X-RateLimit-Limit', options.max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, options.max - count));
    res.setHeader('Retry-After', ttl);
    res.setHeader('X-RateLimit-Reset', Date.now() + ttl * 1000);

    if (count > options.max) {
      return next(new appError(message, 429));
    }

    next();
  });
