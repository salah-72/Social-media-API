import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createAdapter } from '@socket.io/redis-adapter';
import jwt from 'jsonwebtoken';
import config from '@/config/config';
import redisClient, { subClient } from '@/utils/redis';
import { logger } from '@/lib/winston';

let io: Server;

export const initSocket = async (httpServer: HttpServer) => {
  await Promise.all([redisClient.connect(), subClient.connect()]);

  io = new Server(httpServer, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  io.adapter(createAdapter(redisClient, subClient));
  logger.info('Socket.io Redis Adapter configured');

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('no token provided'));

      const payload = jwt.verify(token, config.JWT_ACCESS_KEY) as {
        _id: string;
      };
      socket.data.userId = payload._id.toString();

      next();
    } catch {
      next(new Error('invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.data.userId;

    logger.info(`User ${userId} connected on socket: ${socket.id}`);

    socket.join(`user:${userId}`);

    try {
      await redisClient.sAdd(`user:sockets:${userId}`, socket.id);
    } catch (err) {
      logger.warn(`Failed to track socket for user ${userId}`);
    }

    socket.on('error', (err) => {
      logger.error(`Socket error for user ${userId}:`, err);
    });

    socket.on('disconnect', async () => {
      logger.info(`User ${userId} disconnected from socket: ${socket.id}`);

      try {
        await redisClient.sRem(`user:sockets:${userId}`, socket.id);
      } catch {
        logger.warn(`Failed to remove socket for user ${userId}`);
      }
    });
  });

  return io;
};

export const getIO = () => io;

export const sendRealtimeNotification = async (
  recipientId: string,
  notificationData: object,
) => {
  if (!io) return;

  try {
    const count = await redisClient.incr(
      `user:unread_notifications:${recipientId}`,
    );

    io.to(`user:${recipientId}`).emit('new_notification', {
      ...notificationData,
      unreadCount: count,
    });
  } catch (err) {
    logger.error(`Failed to send notification to user ${recipientId}:`, err);
  }
};
