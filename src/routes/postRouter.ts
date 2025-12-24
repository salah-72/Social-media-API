import { createPost } from '@/controllers/post/createPost';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { upload } from '@/middlewares/multer';
import { Router } from 'express';

const router = Router();

router.post(
  '/createPost',
  authenticate,
  isActive,
  upload.array('images', 5),
  createPost,
);

export default router;
