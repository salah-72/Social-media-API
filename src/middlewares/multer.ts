import appError from '@/utils/appError';
import multer from 'multer';

const multerStorage = multer.memoryStorage();

export const upload = multer({
  storage: multerStorage,
  fileFilter(req, file, callback) {
    if (file.mimetype.startsWith('image')) callback(null, true);
    else callback(new appError('only images allowed', 400));
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

export const uploadMedia = multer({
  storage: multerStorage,
  fileFilter(req, file, callback) {
    if (
      file.mimetype.startsWith('image') ||
      ALLOWED_VIDEO_TYPES.includes(file.mimetype)
    ) {
      callback(null, true);
    } else {
      callback(
        new appError('only images or mp4/mov/webm videos are allowed', 400),
      );
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});
