import { createStory } from '@/controllers/story/createStory';
import { deleteStory } from '@/controllers/story/deleteStory';
import { getMyStories } from '@/controllers/story/getMyStories';
import { getStory } from '@/controllers/story/getStory';
import { getViewers } from '@/controllers/story/getStoryViewers';
import { likeStory } from '@/controllers/story/likeStory';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { isTargetStoryAvailable } from '@/middlewares/isTargetStoryAvailable';
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
router.get('/myStories', authenticate, isActive, getMyStories);
router.delete('/:storyId', authenticate, isActive, deleteStory);
router.get(
  '/:storyId',
  authenticate,
  isActive,
  isTargetStoryAvailable,
  getStory,
);
router.get('/:storyId/viewers', authenticate, isActive, getViewers);
router.post(
  '/:storyId/like',
  authenticate,
  isActive,
  isTargetStoryAvailable,
  likeStory,
);

export default router;
