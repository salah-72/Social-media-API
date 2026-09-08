import { Request, Response, NextFunction } from 'express';
import catchAsync from '@/utils/catchAsync';
import appError from '@/utils/appError';
import User from '@/models/userModel';
import Conversation from '@/models/conversationModel';
import Block from '@/models/blockModel';
import { sendResponse } from '@/utils/sendResponse';
import { Types } from 'mongoose';

export const createGroup = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const creatorId = req.currentuser!._id;
    const { name, memberIds } = req.body as {
      name: string;
      memberIds: string[];
    };

    const uniqueMemberIds = [
      ...new Set(memberIds.filter((id) => id !== creatorId.toString())),
    ].map((id) => new Types.ObjectId(id));

    if (uniqueMemberIds.length < 2) {
      return next(
        new appError(
          'A group must have at least 2 members besides the creator',
          400,
        ),
      );
    }

    const members = await User.find({
      _id: { $in: uniqueMemberIds },
      active: true,
      emailVerified: true,
    }).select('_id');

    if (members.length !== uniqueMemberIds.length) {
      return next(
        new appError(
          'One or more specified members are not valid or not verified',
          400,
        ),
      );
    }

    const hasAnyBlock = await Block.exists({
      $or: [
        { blocker: creatorId, blocked: { $in: uniqueMemberIds } },
        { blocker: { $in: uniqueMemberIds }, blocked: creatorId },
      ],
    });

    if (hasAnyBlock) {
      return next(
        new appError(
          'One or more specified members have blocked you or you have blocked them',
          400,
        ),
      );
    }

    const participants = [creatorId, ...uniqueMemberIds];

    const conversation = await Conversation.create({
      isGroup: true,
      groupName: name,
      participants,
      groupAdmins: [creatorId],
      createdBy: creatorId,
    });

    sendResponse(res, 201, { conversation });
  },
);
