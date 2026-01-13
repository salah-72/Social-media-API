import { createComment } from '@/controllers/comment/createComment';
import { createReply } from '@/controllers/comment/createReplyOnPost';
import { deleteComment } from '@/controllers/comment/deleteComment';
import { commentReplies } from '@/controllers/comment/getCommentReplies';
import { getComments } from '@/controllers/comment/getComments';
import { updateComment } from '@/controllers/comment/updateCommentContent';
import { changeReact } from '@/controllers/like/changeReact';
import { postLikes } from '@/controllers/like/getPostLikes';
import { reaction } from '@/controllers/like/getUsersByReact';
import { like } from '@/controllers/like/Like&UnLike';
import { postsLikedByMe } from '@/controllers/like/postsLikedByMe';
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
import { isTargetPostAvailable } from '@/middlewares/isTargetPostAvailable';
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
router.get('/likes', authenticate, isActive, postsLikedByMe);
router.get(
  '/:postId/likedUsers',
  authenticate,
  isActive,
  isTargetPostAvailable,
  postLikes,
);
router.patch(
  '/:postId/react',
  authenticate,
  isActive,
  isTargetPostAvailable,
  changeReact,
);
router.get(
  '/:postId/react/:type',
  authenticate,
  isActive,
  isTargetPostAvailable,
  reaction,
);
router.get('/:postId', authenticate, isActive, getPost);

router.post(
  '/:postId/like',
  authenticate,
  isActive,
  isTargetPostAvailable,
  like,
);

router.post(
  '/:postId/comment',
  authenticate,
  isActive,
  isTargetPostAvailable,
  createComment,
);
router.post(
  '/:postId/comment/:commentId',
  authenticate,
  isActive,
  isTargetPostAvailable,
  createReply,
);
router.patch(
  '/:postId/comment/:commentId',
  authenticate,
  isActive,
  isTargetPostAvailable,
  updateComment,
);
router.delete(
  '/:postId/comment/:commentId',
  authenticate,
  isActive,
  isTargetPostAvailable,
  deleteComment,
);
router.get(
  '/:postId/comments',
  authenticate,
  isActive,
  isTargetPostAvailable,
  getComments,
);
router.get(
  '/:postId/comment/:commentId/replies',
  authenticate,
  isActive,
  isTargetPostAvailable,
  commentReplies,
);
export default router;
