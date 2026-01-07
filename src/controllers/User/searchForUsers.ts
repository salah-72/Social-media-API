import Block from '@/models/blockModel';
import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { Request, Response, NextFunction, text } from 'express';

export const searchUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const input = req.query.text?.toString().trim();
    if (!input) return next(new appError('query is required to search', 400));

    const content = input.split(' ');
    let search;

    const blocks = await Block.find({
      $or: [
        { blocked: req.currentuser?._id },
        { blocker: req.currentuser?._id },
      ],
    });

    const BlocksIds = blocks.map((e) => {
      if (e.blocker.toString() === req.currentuser?._id.toString())
        return e.blocked;
      else return e.blocker;
    });

    if (content.length > 1) {
      const firstName = content[0];
      const lastName = content[1];

      search = {
        $search: {
          index: 'user_search',
          compound: {
            must: [
              {
                text: {
                  query: firstName,
                  path: 'firstName',
                  fuzzy: { maxEdits: 1 },
                },
              },
              {
                text: {
                  query: lastName,
                  path: 'lastName',
                  fuzzy: { maxEdits: 1 },
                },
              },
            ],
          },
        },
      };
    } else {
      const name = content[0];
      search = {
        $search: {
          index: 'user_search',
          compound: {
            should: [
              {
                text: {
                  query: name,
                  path: 'firstName',
                  fuzzy: { maxEdits: 1 },
                  score: { boost: { value: 8 } },
                },
              },
              {
                text: {
                  query: name,
                  path: 'lastName',
                  fuzzy: { maxEdits: 1 },
                  score: { boost: { value: 2 } },
                },
              },
              {
                text: {
                  query: name,
                  path: 'username',
                  fuzzy: { maxEdits: 1 },
                  score: { boost: { value: 5 } },
                },
              },
            ],
          },
        },
      };
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const users = await User.aggregate([
      search,
      {
        $match: {
          active: true,
          emailVerified: true,
          _id: { $nin: BlocksIds },
        },
      },
      {
        $project: {
          username: 1,
          firstName: 1,
          lastName: 1,
          profilePhoto: 1,
          score: { $meta: 'searchScore' },
        },
      },
      { $sort: { score: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        page,
        limit,
        length: users.length,
        users,
      },
    });
  },
);
