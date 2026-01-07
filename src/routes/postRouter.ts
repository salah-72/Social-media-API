import { addImg } from '@/controllers/post/addImgToPost';
import { createPost } from '@/controllers/post/createPost';
import { deleteImg } from '@/controllers/post/deleteImgFromPost';
import { deletePost } from '@/controllers/post/deletePost';
import { getMyPosts } from '@/controllers/post/getMyPosts';
import { getPost } from '@/controllers/post/getPost';
import { timeLinePosts } from '@/controllers/post/getTimeLinePosts';
import { getUserPosts } from '@/controllers/post/getUserPosts';
import { postsSearch } from '@/controllers/post/searchForPosts';
import { updatePost } from '@/controllers/post/updatePost';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { isFollower } from '@/middlewares/isFollower';
import { isTargetUserAvailable } from '@/middlewares/isTargetUserAvailable';
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
router.delete('/deletePost/:id', authenticate, isActive, deletePost);
router.patch('/updatePost/:id', authenticate, isActive, updatePost);
router.post(
  '/addImg/:id',
  authenticate,
  isActive,
  upload.single('images'),
  addImg,
);
router.delete(
  '/deleteImg/:postId/img/:imgId',
  authenticate,
  isActive,
  deleteImg,
);

router.get('/myPosts', authenticate, isActive, getMyPosts);
router.get('/searchPosts', authenticate, isActive, postsSearch);
router.get('/timeLine', authenticate, isActive, timeLinePosts);
router.get(
  '/user/:id',
  authenticate,
  isActive,
  isTargetUserAvailable,
  isFollower,
  getUserPosts,
);
router.get('/:postId', authenticate, isActive, getPost);
export default router;
