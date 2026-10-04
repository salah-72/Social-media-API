import { Request, Response, NextFunction } from 'express';
import appError from '@/utils/appError';
import { isImageBuffer, isAllowedMediaBuffer } from '@/utils/fileSignature';

const collectFiles = (req: Request): Express.Multer.File[] => {
  if (req.file) return [req.file];
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === 'object') {
    return Object.values(req.files).flat();
  }
  return [];
};

export const verifyImageContent = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const files = collectFiles(req);
  for (const file of files) {
    if (!isImageBuffer(file.buffer)) {
      return next(new appError('uploaded file is not a valid image', 400));
    }
  }
  next();
};

export const verifyMediaContent = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const files = collectFiles(req);
  for (const file of files) {
    if (!isAllowedMediaBuffer(file.buffer)) {
      return next(
        new appError('uploaded file is not a valid image or video', 400),
      );
    }
  }
  next();
};
