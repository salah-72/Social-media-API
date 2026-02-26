import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

type validationSchema = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export const validateRequest = (schema: validationSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = (await schema.body.parseAsync(req.body)) as typeof req.body;
      }
      if (schema.params) {
        const parsedParams = (await schema.params.parseAsync(
          req.params,
        )) as typeof req.params;
        Object.assign(req.params, parsedParams);
      }
      if (schema.query) {
        const parsedQuery = (await schema.query.parseAsync(
          req.query,
        )) as typeof req.query;
        Object.assign(req.query, parsedQuery);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'fail',
          message: 'Validation error',
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};
