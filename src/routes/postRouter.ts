import { changeCommentReact } from '@/controllers/comment/changeCommentReact';
import { createComment } from '@/controllers/comment/createComment';
import { createReply } from '@/controllers/comment/createReplyOnPost';
import { deleteComment } from '@/controllers/comment/deleteComment';
import { commentReplies } from '@/controllers/comment/getCommentReplies';
import { getComments } from '@/controllers/comment/getComments';
import { likeComment } from '@/controllers/comment/Like&UnLikeComment';
import { updateComment } from '@/controllers/comment/updateCommentContent';
import { changeReact } from '@/controllers/post/changePostReact';
import { postLikes } from '@/controllers/post/getPostLikes';
import { reaction } from '@/controllers/post/getUsersByReact';
import { likePost } from '@/controllers/post/Like&UnLikePost';
import { postsLikedByMe } from '@/controllers/post/postsLikedByMe';
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
import { commentLikes } from '@/controllers/comment/getLikedUsers';
import { usersByReaction } from '@/controllers/comment/getUsersByReaction';
import { validateRequest } from '@/middlewares/validation';
import {
  changeTypeValidation,
  createCommentValidation,
  createPostValidation,
  createReplyValidation,
  deleteImgFromPostValidation,
  deletePostValidation,
  getLikedUsersOnCommentValidation,
  getLIkedUsersValidation,
  getPostsValidation,
  getUserPostsValidation,
  PostValidation,
  updatePostValidation,
} from '@/validation/postValidation';

const router = Router();

/**
 * @swagger
 * /api/v1/posts/createPost:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               whoCanSee:
 *                 type: string
 *                 enum: [public, followers, private]
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     postId:
 *                       type: string
 *                       example: 1234567890abcdef
 *                     content:
 *                       type: string
 *                       example: This is my new post content.
 *                     images:
 *                       type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         url:
 *                           type: string
 *                           example: https://res.cloudinary.com/demo/image/upload/v1610000000/sample.jpg
 *                         publicId:
 *                           type: string
 *                           example: sample.jpg
 *       400:
 *         description: Bad request - invalid input data
 *         content:
 *           application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
router.post(
  '/createPost',
  authenticate,
  isActive,
  upload.array('images', 5),
  validateRequest({ body: createPostValidation }),
  createPost,
);

/**
 * @swagger
 * /api/v1/posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Story not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/deletePost/:id',
  authenticate,
  isActive,
  validateRequest({ params: deletePostValidation }),
  deletePost,
);

/**
 * @swagger
 * /api/v1/posts/updatePost/{id}:
 *   patch:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 optional: true
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               whoCanSee:
 *                 type: string
 *                 optional: true
 *                 enum: [public, followers, private]
 *               status:
 *                 type: string
 *                 optional: true
 *                 enum: [published]
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/updatePost/:id',
  authenticate,
  isActive,
  validateRequest({ params: updatePostValidation }),
  validateRequest({ body: updatePostValidation }),
  updatePost,
);

/**
 * @swagger
 * /api/v1/posts/addImg/{id}:
 *   post:
 *     summary: Add an image to a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/addImg/:postId',
  authenticate,
  isActive,
  validateRequest({ params: PostValidation }),
  upload.single('images'),
  addImg,
);

/**
 * @swagger
 * /api/v1/posts/deleteImg/{postId}/img/{imgId}:
 *   delete:
 *     summary: Delete an image from a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: imgId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Post not found or Image not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/deleteImg/:postId/img/:imgId',
  authenticate,
  isActive,
  validateRequest({ params: deleteImgFromPostValidation }),
  deleteImg,
);

/**
 * @swagger
 * /api/v1/posts/myPosts:
 *   get:
 *     summary: Get my posts
 *     description: Retrieve a paginated list of posts created by the authenticated user.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of stories per page
 *     responses:
 *       200:
 *         description: User posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 5
 *                     length:
 *                       type: integer
 *                       example: 5
 *                     posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           postId:
 *                             type: string
 *                             example: 1234567890abcdef
 *                           authorId:
 *                             type: string
 *                             example: 0987654321fedcba
 *                           content:
 *                             type: string
 *                             example: This is my post content.
 *                           imgUrl:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: https://example.com/post-image.jpg
 *                           whoCanSee:
 *                             type: string
 *                             example: public
 *                           likesCount:
 *                             type: integer
 *                             example: 5
 *                           commentsCount:
 *                             type: integer
 *                             example: 10
 *                           createdAt:
 *                             type: string
 *                             example: 2023-01-01T00:00:00.000Z
 *                           updatedAt:
 *                             type: string
 *                             example: 2023-01-01T00:00:00.000Z
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get(
  '/myPosts',
  authenticate,
  isActive,
  validateRequest({ query: getPostsValidation }),
  getMyPosts,
);

/**
 * @swagger
 * /api/v1/posts/searchPosts:
 *   get:
 *     summary: Search for posts
 *     description: Search for posts based on a query string. The search will look for matches in the content of the posts and return results that the authenticated user has permission to see.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: text
 *         required: true
 *         schema:
 *           type: string
 *         description: The text to search for in post content
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 5
 *                     length:
 *                       type: integer
 *                       example: 5
 *                     posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           postId:
 *                             type: string
 *                             example: 1234567890abcdef
 *                           authorId:
 *                             type: string
 *                             example: 0987654321fedcba
 *                           content:
 *                             type: string
 *                             example: This is my post content.
 *                           imgUrl:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: https://example.com/post-image.jpg
 *                           likesCount:
 *                             type: integer
 *                             example: 5
 *                           commentsCount:
 *                             type: integer
 *                             example: 10
 *                           createdAt:
 *                             type: string
 *                             example: 2023-01-01T00:00:00.000Z
 *                           updatedAt:
 *                             type: string
 *                             example: 2023-01-01T00:00:00.000Z
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/searchPosts',
  authenticate,
  isActive,
  validateRequest({ query: getPostsValidation }),
  postsSearch,
);

/**
 * @swagger
 * /api/v1/posts/timeLine:
 *   get:
 *     summary: Get timeline posts
 *     description: Retrieve posts for the authenticated user's timeline.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 5
 *                     length:
 *                       type: integer
 *                       example: 5
 *                     posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           postId:
 *                             type: string
 *                             example: 1234567890abcdef
 *                           authorId:
 *                             type: string
 *                             example: 0987654321fedcba
 *                           content:
 *                             type: string
 *                             example: This is my post content.
 *                           imgUrl:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: https://example.com/post-image.jpg
 *                           likesCount:
 *                             type: integer
 *                             example: 5
 *                           commentsCount:
 *                             type: integer
 *                             example: 10
 *                           createdAt:
 *                             type: string
 *                             example: 2023-01-01T00:00:00.000Z
 *                           updatedAt:
 *                             type: string
 *                             example: 2023-01-01T00:00:00.000Z
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/timeLine',
  authenticate,
  isActive,
  validateRequest({ query: getPostsValidation }),
  timeLinePosts,
);

/**
 * @swagger
 * /api/v1/posts/user/{id}:
 *   get:
 *     summary: Get posts by user ID
 *     description: Retrieve posts for a specific user by his ID.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 5
 *                     length:
 *                       type: integer
 *                       example: 5
 *                     posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           postId:
 *                             type: string
 *                             example: 1234567890abcdef
 *                           authorId:
 *                             type: string
 *                             example: 0987654321fedcba
 *                           content:
 *                             type: string
 *                             example: This is my post content.
 *                           imgUrl:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: https://example.com/post-image.jpg
 *                           likesCount:
 *                             type: integer
 *                             example: 5
 *                           commentsCount:
 *                             type: integer
 *                             example: 10
 *                           createdAt:
 *                             type: string
 *                             example: 2023-01-01T00:00:00.000Z
 *                           updatedAt:
 *                             type: string
 *                             example: 2023-01-01T00:00:00.000Z
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - user is not authorized to view posts of this user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/user/:id',
  authenticate,
  isActive,
  validateRequest({ params: getUserPostsValidation }),
  validateRequest({ query: getPostsValidation }),
  isTargetUserAvailable,
  isFollower,
  getUserPosts,
);

/**
 * @swagger
 * /api/v1/posts/likes:
 *   get:
 *     summary: Get posts liked by me
 *     description: Retrieve a list of posts that the authenticated user has liked.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 5
 *                     length:
 *                       type: integer
 *                       example: 5
 *                     posts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           postId:
 *                             type: string
 *                             example: 1234567890abcdef
 *                           authorId:
 *                             type: string
 *                             example: 0987654321fedcba
 *                           content:
 *                             type: string
 *                             example: This is my post content.
 *                           imgUrl:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: https://example.com/post-image.jpg
 *                           likesCount:
 *                             type: integer
 *                             example: 5
 *                           commentsCount:
 *                             type: integer
 *                             example: 10
 *                           createdAt:
 *                             type: string
 *                             example: 2023-01-01T00:00:00.000Z
 *                           updatedAt:
 *                             type: string
 *                             example: 2023-01-01T00:00:00.000Z
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/likes',
  authenticate,
  isActive,
  validateRequest({ query: getPostsValidation }),
  postsLikedByMe,
);

/**
 * @swagger
 * /api/v1/posts/{postId}/likedUsers:
 *   get:
 *     summary: Get users who liked a specific post
 *     description: Retrieve a list of users who have liked a specific post.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve liked users for
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     length:
 *                       type: integer
 *                       example: 20
 *                     Users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                             example: ahmed123
 *                           firstName:
 *                             type: string
 *                             example: Ahmed
 *                           lastName:
 *                             type: string
 *                             example: Ali
 *                           profilePhoto:
 *                             type: string
 *                             example: https://example.com/profile-photo.jpg
 *                           type:
 *                             type: string
 *                             example: love
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: post or comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:postId/likedUsers',
  authenticate,
  isActive,
  validateRequest({ params: PostValidation }),
  validateRequest({ query: getPostsValidation }),
  isTargetPostAvailable,
  postLikes,
);

/**
 * @swagger
 * /api/v1/posts/{postId}/like:
 *   patch:
 *     summary: Change reaction on a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               react:
 *                 type: string
 *                 example: love
 *     responses:
 *       200:
 *         description: Reaction updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Story not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/:postId/react',
  authenticate,
  isActive,
  validateRequest({ query: PostValidation }),
  validateRequest({ body: changeTypeValidation }),
  isTargetPostAvailable,
  changeReact,
);

/**
 * @swagger
 * /api/v1/posts/{postId}/react/{type}:
 *   get:
 *     summary: Get users who liked a specific post by reaction type
 *     description: Retrieve a list of users who have liked a specific post by a specific reaction type.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve liked users for
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The reaction type (e.g., love, like, etc.)
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     length:
 *                       type: integer
 *                       example: 20
 *                     Users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                             example: ahmed123
 *                           firstName:
 *                             type: string
 *                             example: Ahmed
 *                           lastName:
 *                             type: string
 *                             example: Ali
 *                           profilePhoto:
 *                             type: string
 *                             example: https://example.com/profile-photo.jpg
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: post or comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:postId/react/:type',
  authenticate,
  isActive,
  validateRequest({ params: getLIkedUsersValidation }),
  validateRequest({ query: getPostsValidation }),
  isTargetPostAvailable,
  reaction,
);

/**
 * @swagger
 * /api/v1/posts/{postId}:
 *   get:
 *     summary: Get a specific post
 *     description: Retrieve a specific post by its ID.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     postId:
 *                       type: string
 *                       example: 1234567890abcdef
 *                     authorId:
 *                       type: string
 *                       example: 0987654321fedcba
 *                     content:
 *                       type: string
 *                       example: This is my post content.
 *                     imgUrl:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: https://example.com/post-image.jpg
 *                     likesCount:
 *                       type: integer
 *                       example: 5
 *                     commentsCount:
 *                       type: integer
 *                       example: 10
 *                     createdAt:
 *                        type: string
 *                        example: 2023-01-01T00:00:00.000Z
 *                     updatedAt:
 *                        type: string
 *                        example: 2023-01-01T00:00:00.000Z
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:postId',
  authenticate,
  isActive,
  validateRequest({ params: PostValidation }),
  getPost,
);

/**
 * @swagger
 * /api/v1/posts/{postId}/like:
 *   post:
 *     summary: Like or Unlike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               react:
 *                 type: string
 *                 example: like
 *     responses:
 *       200:
 *         description: Action successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Story not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:postId/like',
  authenticate,
  isActive,
  validateRequest({ params: PostValidation }),
  validateRequest({ body: changeTypeValidation }),
  isTargetPostAvailable,
  likePost,
);

/**
 * @swagger
 * /api/v1/posts/{postId}/comment:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: This is a comment on the post.
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:postId/comment',
  authenticate,
  isActive,
  validateRequest({ params: PostValidation }),
  validateRequest({ body: createCommentValidation }),
  isTargetPostAvailable,
  createComment,
);

/**
 * @swagger
 * /api/v1/posts/{postId}/comment/{commentId}:
 *   post:
 *     summary: Add a reply to a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: This is a reply to the comment.
 *     responses:
 *       201:
 *         description: Reply created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Post or comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:postId/comment/:commentId',
  authenticate,
  isActive,
  validateRequest({ params: createReplyValidation }),
  validateRequest({ body: createCommentValidation }),
  isTargetPostAvailable,
  createReply,
);

/**
 * @swagger
 * /api/v1/posts/{postId}/comment/{commentId}:
 *   patch:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: This is an updated comment.
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Post or comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/:postId/comment/:commentId',
  authenticate,
  isActive,
  validateRequest({ params: createReplyValidation }),
  validateRequest({ body: createCommentValidation }),
  isTargetPostAvailable,
  updateComment,
);

/**
 * @swagger
 * /api/v1/posts/{postId}/comment/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Post or comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:postId/comment/:commentId',
  authenticate,
  isActive,
  validateRequest({ params: createReplyValidation }),
  isTargetPostAvailable,
  deleteComment,
);

/**
 * @swagger
 * /api/v1/posts/{postId}/comments:
 *   get:
 *     summary: Get comments for a specific post
 *     description: Retrieve a paginated list of comments for a specific post.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of stories per page
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 5
 *                     length:
 *                       type: integer
 *                       example: 5
 *                     Comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: 0987654321fedcba
 *                           content:
 *                             type: string
 *                             example: This is my comment content.
 *                           likesCount:
 *                             type: integer
 *                             example: 5
 *                           commentsCount:
 *                             type: integer
 *                             example: 10
 *                           createdAt:
 *                             type: string
 *                             example: 2023-01-01T00:00:00.000Z
 *                           updatedAt:
 *                             type: string
 *                             example: 2023-01-01T00:00:00.000Z
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:postId/comments',
  authenticate,
  validateRequest({ params: PostValidation }),
  validateRequest({ query: getPostsValidation }),
  isActive,
  isTargetPostAvailable,
  getComments,
);

/**
 * @swagger
 * /api/v1/posts/{postId}/comment/{commentId}/replies:
 *   get:
 *     summary: Get replies for a specific comment
 *     description: Retrieve a paginated list of replies for a specific comment.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of stories per page
 *     responses:
 *       200:
 *         description: Replies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 5
 *                     length:
 *                       type: integer
 *                       example: 5
 *                     Comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: 0987654321fedcba
 *                           content:
 *                             type: string
 *                             example: This is my comment content.
 *                           likesCount:
 *                             type: integer
 *                             example: 5
 *                           commentsCount:
 *                             type: integer
 *                             example: 10
 *                           createdAt:
 *                             type: string
 *                             example: 2023-01-01T00:00:00.000Z
 *                           updatedAt:
 *                             type: string
 *                             example: 2023-01-01T00:00:00.000Z
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:postId/comment/:commentId/replies',
  authenticate,
  isActive,
  validateRequest({ params: createReplyValidation }),
  validateRequest({ query: getPostsValidation }),
  isTargetPostAvailable,
  commentReplies,
);

/**
 * @swagger
 * /api/v1/posts/{postId}/comment/{commentId}/like:
 *   post:
 *     summary: Like or Unlike a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               react:
 *                 type: string
 *                 example: like
 *     responses:
 *       200:
 *         description: Action successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Story not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:postId/comment/:commentId/like',
  authenticate,
  isActive,
  validateRequest({ params: createReplyValidation }),
  validateRequest({ body: changeTypeValidation }),
  isTargetPostAvailable,
  likeComment,
);

/**
 * @swagger
 * /api/v1/posts/{postId}/comment/{commentId}/like:
 *   patch:
 *     summary: Change reaction on a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               react:
 *                 type: string
 *                 example: love
 *     responses:
 *       200:
 *         description: Reaction updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Story not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/:postId/comment/:commentId/like',
  authenticate,
  isActive,
  validateRequest({ params: createReplyValidation }),
  validateRequest({ body: changeTypeValidation }),
  isTargetPostAvailable,
  changeCommentReact,
);

/**
 * @swagger
 * /api/v1/posts/{postId}/comment/{commentId}/likes:
 *   get:
 *     summary: Get users who liked the comment
 *     description: Retrieve a paginated list of users who have liked a specific comment.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Likes list retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     length:
 *                       type: integer
 *                       example: 5
 *                     likes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                             example: Ahmed123
 *                           firstName:
 *                             type: string
 *                             example: Ahmed
 *                           lastName:
 *                             type: string
 *                             example: Salah
 *                           profilePhoto:
 *                             type: string
 *                             example: https://example.com/profile-photo.jpg
 *                           react:
 *                             type: string
 *       404:
 *         description: post or comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:postId/comment/:commentId/like',
  authenticate,
  isActive,
  validateRequest({ params: createReplyValidation }),
  validateRequest({ query: getPostsValidation }),
  isTargetPostAvailable,
  commentLikes,
);

/**
 * @swagger
 * /api/v1/posts/{postId}/comment/{commentId}/react/{type}:
 *   get:
 *     summary: Get users who liked a specific post by reaction type
 *     description: Retrieve a list of users who have liked a specific comment by a specific reaction type.
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve liked users for
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to retrieve liked users for
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: The reaction type (e.g., love, like, etc.)
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of Users per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     length:
 *                       type: integer
 *                       example: 20
 *                     Users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                             example: ahmed123
 *                           firstName:
 *                             type: string
 *                             example: Ahmed
 *                           lastName:
 *                             type: string
 *                             example: Ali
 *                           profilePhoto:
 *                             type: string
 *                             example: https://example.com/profile-photo.jpg
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: post or comment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:postId/comment/:commentId/like/react/:type',
  authenticate,
  isActive,
  validateRequest({ params: getLikedUsersOnCommentValidation }),
  isTargetPostAvailable,
  usersByReaction,
);
export default router;
