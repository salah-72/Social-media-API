import { Server } from 'socket.io';
import type { Server as HttpServer } from 'http';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    console.log('user connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('user disconnected:', socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
