import appError from '@/utils/appError';
import multer from 'multer';

const multerStorage = multer.memoryStorage();

export const upload = multer({
  storage: multerStorage,
  fileFilter(req, file, callback) {
    if (file.mimetype.startsWith('image')) callback(null, true);
    else callback(new appError('omly images allowed', 400));
  },
  limits: { fileSize: 2 * 1024 * 1024 },
});
