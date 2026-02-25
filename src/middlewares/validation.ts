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
        req.params = (await schema.params.parseAsync(
          req.params,
        )) as typeof req.params;
      }
      if (schema.query) {
        req.query = (await schema.query.parseAsync(
          req.query,
        )) as typeof req.query;
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
