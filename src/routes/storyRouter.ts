import { createStory } from '@/controllers/story/createStory';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { upload } from '@/middlewares/multer';
import { Router } from 'express';

const router = Router();

router.post(
  '/story',
  authenticate,
  isActive,
  upload.single('img'),
  createStory,
);

export default router;
