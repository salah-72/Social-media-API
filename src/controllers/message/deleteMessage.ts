import { Request, Response, NextFunction } from 'express';
import Message from '@/models/messageModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';

export const deleteMessage = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const messageId = req.params.id;
    const userId = req.currentuser!._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return next(new appError('Message not found', 404));
    }

    if (message.sender.toString() !== userId.toString()) {
      return next(
        new appError('You are not authorized to delete this message', 403),
      );
    }

    await message.deleteOne();

    res.status(204).send();
  },
);
