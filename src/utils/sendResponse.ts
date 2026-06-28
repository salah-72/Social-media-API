import { Response } from 'express';

interface paginationInput {
  page: number;
  limit: number;
  total: number;
}

export const sendResponse = (
  res: Response,
  statusCode: number,
  data?: Record<string, any>,
  options?: {
    message?: string;
    pagination?: paginationInput;
    results?: number;
  },
): Response => {
  const body: Record<string, any> = { status: 'success' };
  if (options?.message) body.message = options.message;
  if (options?.results !== undefined) body.results = options.results;
  if (options?.pagination) {
    const { page, limit, total } = options.pagination;

    body.pagination = {
      page,
      limit,
      total,
      noOfPages: Math.ceil(total / limit),
    };
  }
  if (data !== undefined) body.data = data;

  return res.status(statusCode).json(body);
};
