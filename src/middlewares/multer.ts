import appError from '@/utils/appError';
import multer from 'multer';
import path from 'path';

const multerStorage = multer.memoryStorage();

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'image/gif',
];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export const upload = multer({
  storage: multerStorage,
  fileFilter(req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase();

    if (
      allowedMimeTypes.includes(file.mimetype) &&
      allowedExtensions.includes(ext)
    ) {
      callback(null, true);
    } else {
      callback(
        new appError(
          'Invalid file type. Only standard images are allowed.',
          400,
        ),
      );
    }
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});
