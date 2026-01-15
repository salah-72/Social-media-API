import { createStory } from '@/controllers/story/createStory';
import { deleteStory } from '@/controllers/story/deleteStory';
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

router.delete('/:storyId', authenticate, isActive, deleteStory);

export default router;
