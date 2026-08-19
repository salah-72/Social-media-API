import { createStory } from '@/controllers/story/createStory';
import { deleteStory } from '@/controllers/story/deleteStory';
import { getMyStories } from '@/controllers/story/getMyStories';
import { getStory } from '@/controllers/story/getStory';
import { storyLikes } from '@/controllers/story/getStoryLikes';
import { getViewers } from '@/controllers/story/getStoryViewers';
import { likeStory } from '@/controllers/story/likeStory';
import { authenticate } from '@/middlewares/authenticate';
import { loadBlockList } from '@/middlewares/blocks';
import { isActive } from '@/middlewares/isActive';
import { isTargetStoryAvailable } from '@/middlewares/isTargetStoryAvailable';
import { upload } from '@/middlewares/multer';
import { rateLimit } from '@/middlewares/rateLimit';
import { validateRequest } from '@/middlewares/validation';
import {
  getStoriesValidation,
  getStoryValidation,
  reactTypeValidation,
  storyValidation,
} from '@/validation/storyValidation';
import { Router } from 'express';

const router = Router();

const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many actions, please try again after one minute',
});
/**
 * @swagger
 * /api/v1/stories/story:
 *   post:
 *     summary: Create a new story
 *     description: Create a new story with optional image and content. The story can be visible to the public, followers, or private.
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               img:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               content:
 *                 type: string
 *                 example: This is my new story!
 *               whoCanSee:
 *                 type: string
 *                 enum: [public, followers, private]
 *                 default: public
 *     responses:
 *       201:
 *         description: Story created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
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
 *
 */
router.post(
  '/story',
  authenticate,
  isActive,
  rateLimit,
  upload.single('img'),
  validateRequest({ body: storyValidation }),
  createStory,
);

/**
 * @swagger
 * /api/v1/stories/myStories:
 *   get:
 *     summary: Get my stories
 *     description: Retrieve a paginated list of stories created by the authenticated user.
 *     tags: [Stories]
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
 *         description: User stories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     noOfPages:
 *                       type: integer
 *                       example: 1
 *                 data:
 *                   type: object
 *                   properties:
 *                     stories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 1234567890abcdef
 *                           author:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                                 example: ahmed123
 *                               profilePhoto:
 *                                 type: string
 *                                 example: https://example.com/image.jpg
 *                               firstName:
 *                                 type: string
 *                                 example: Ahmed
 *                               lastName:
 *                                 type: string
 *                                 example: Salah
 *                           content:
 *                             type: string
 *                             example: This is my story content.
 *                           imgUrl:
 *                             type: string
 *                             example: https://example.com/story-image.jpg
 *                           viewCount:
 *                             type: integer
 *                             example: 5
 *                           likesCount:
 *                             type: integer
 *                             example: 5
 *                           createdAt:
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
  '/myStories',
  authenticate,
  isActive,
  validateRequest({ query: getStoriesValidation }),
  getMyStories,
);

/**
 * @swagger
 * /api/v1/stories/{storyId}:
 *   delete:
 *     summary: Delete a story
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Story deleted successfully
 *       404:
 *         description: Story not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:storyId',
  authenticate,
  isActive,
  validateRequest({ params: getStoryValidation }),
  deleteStory,
);

/**
 * @swagger
 * /api/v1/stories/{storyId}:
 *   get:
 *     summary: Get a specific story
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Story details retrieved
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
 *                     story:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 1234567890abcdef
 *                         author:
 *                           type: object
 *                           properties:
 *                             username:
 *                               type: string
 *                               example: ahmed123
 *                             profilePhoto:
 *                               type: string
 *                               example: https://example.com/image.jpg
 *                             firstName:
 *                               type: string
 *                               example: Ahmed
 *                             lastName:
 *                               type: string
 *                               example: Salah
 *                         content:
 *                           type: string
 *                           example: This is my story content.
 *                         imgUrl:
 *                           type: string
 *                           example: https://example.com/story-image.jpg
 *                         viewCount:
 *                           type: integer
 *                           example: 5
 *                         likesCount:
 *                           type: integer
 *                           example: 5
 *                         createdAt:
 *                           type: string
 *                           example: 2023-01-01T00:00:00.000Z
 *       401:
 *        description: Unauthorized - user not authenticated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *       404:
 *         description: Story not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:storyId',
  authenticate,
  isActive,
  validateRequest({ params: getStoryValidation }),
  isTargetStoryAvailable,
  getStory,
);

/**
 * @swagger
 * /api/v1/stories/{storyId}/viewers:
 *   get:
 *     summary: Get story viewers
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
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
 *         description: Viewers list retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     noOfPages:
 *                       type: integer
 *                       example: 1
 *                 data:
 *                   type: object
 *                   properties:
 *                     viewers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           at:
 *                             type: string
 *                             format: date-time
 *                             example: 2023-01-01T00:00:00.000Z
 *                           user:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                                 example: Ahmed123
 *                               profilePhoto:
 *                                 type: string
 *                                 example: https://example.com/profile-photo.jpg
 *                               firstName:
 *                                 type: string
 *                                 example: Ahmed
 *                               lastName:
 *                                 type: string
 *                                 example: Salah
 *       404:
 *         description: Story not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:storyId/viewers',
  authenticate,
  isActive,
  validateRequest({ params: getStoryValidation, query: getStoriesValidation }),
  loadBlockList,
  getViewers,
);

/**
 * @swagger
 * /api/v1/stories/{storyId}/like:
 *   post:
 *     summary: Like, Unlike, or Change reaction on a story
 *     description: Like, Unlike, or Change reaction on a story. If the user has already liked the story with the same reaction type, it will unlike the story. If the user has liked the story with a different reaction type, it will change the reaction type.
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [like, love, haha, wow, sad, angry]
 *                 default: like
 *                 example: love
 *     responses:
 *       200:
 *         description: Reaction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       201:
 *         description: Story liked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       204:
 *         description: Reaction removed (Unliked) successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Story not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:storyId/like',
  authenticate,
  isActive,
  rateLimiter,
  validateRequest({ params: getStoryValidation, body: reactTypeValidation }),
  isTargetStoryAvailable,
  likeStory,
);

/**
 * @swagger
 * /api/v1/stories/{storyId}/likes:
 *   get:
 *     summary: Get users who liked the story
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storyId
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
 *                 results:
 *                   type: integer
 *                   example: 5
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     noOfPages:
 *                       type: integer
 *                       example: 1
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 1234567890abcdef
 *                           user:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                                 example: Ahmed123
 *                               profilePhoto:
 *                                 type: string
 *                                 example: https://example.com/profile-photo.jpg
 *                               firstName:
 *                                 type: string
 *                                 example: Ahmed
 *                               lastName:
 *                                 type: string
 *                                 example: Salah
 *                           type:
 *                             type: string
 *                             example: love
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2023-01-01T00:00:00.000Z
 *       404:
 *         description: Story not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:storyId/likes',
  authenticate,
  isActive,
  validateRequest({ params: getStoryValidation, query: getStoriesValidation }),
  loadBlockList,
  storyLikes,
);

export default router;
