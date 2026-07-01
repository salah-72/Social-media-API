import User from '@/models/userModel';
import appError from '@/utils/appError';
import catchAsync from '@/utils/catchAsync';
import { sendResponse } from '@/utils/sendResponse';
import { Request, Response, NextFunction } from 'express';

export const searchUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const input = req.query.query?.toString().trim();
    if (!input) return next(new appError('search query is required', 400));

    const content = input.split(' ');
    let search;

    const blockIds = [...(req.blockIds ?? [])];

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

    const matchStage = {
      $match: {
        active: true,
        emailVerified: true,
        _id: { $nin: blockIds },
      },
    };

    const [users, totalResult] = await Promise.all([
      User.aggregate([
        search,
        matchStage,
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
      ]),
      User.aggregate([search, matchStage, { $count: 'total' }]),
    ]);

    const total = totalResult[0]?.total ?? 0;

    sendResponse(res, 200, { users }, { pagination: { page, limit, total } });
  },
);
