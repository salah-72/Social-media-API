import { changeStoryReact } from '@/controllers/story/changeStoryReact';
import { createStory } from '@/controllers/story/createStory';
import { deleteStory } from '@/controllers/story/deleteStory';
import { getMyStories } from '@/controllers/story/getMyStories';
import { getStory } from '@/controllers/story/getStory';
import { storyLikes } from '@/controllers/story/getStoryLikes';
import { getViewers } from '@/controllers/story/getStoryViewers';
import { likeStory } from '@/controllers/story/likeStory';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { isTargetStoryAvailable } from '@/middlewares/isTargetStoryAvailable';
import { upload } from '@/middlewares/multer';
import { Router } from 'express';

const router = Router();

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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               img:
 *                 type: string
 *                 format: binary
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
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     storyId:
 *                       type: string
 *                       example: 1234567890abcdef
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
  upload.single('img'),
  createStory,
);

/**
 * @swagger
 * /api/v1/stories/myStories:
 *   get:
 *     summary: Get my stories
 *     description: Retrieve a list of stories created by the authenticated user.
 *     tags: [Stories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's stories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                        storyId:
 *                          type: string
 *                          example: 1234567890abcdef
 *                        authorId:
 *                          type: string
 *                          example: 0987654321fedcba
 *                        content:
 *                          type: string
 *                          example: This is my story content.
 *                        imgUrl:
 *                          type: string
 *                          example: https://example.com/story-image.jpg
 *                        whoCanSee:
 *                          type: string
 *                          example: public
 *                        viewCount:
 *                          type: integer
 *                          example: 5
 *                        likesCount:
 *                          type: integer
 *                          example: 5
 *                        createdAt:
 *                          type: string
 *                          example: 2023-01-01T00:00:00Z
 *       401:
 *        description: Unauthorized - user not authenticated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
router.get('/myStories', authenticate, isActive, getMyStories);

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
router.delete('/:storyId', authenticate, isActive, deleteStory);

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
 *                         authorId:
 *                           type: string
 *                           example: 1234567890abcdef
 *                         content:
 *                           type: string
 *                           example: This is my story content.
 *                         storyImg:
 *                           type: string
 *                           example: https://example.com/story-image.jpg
 *                         whoCanSee:
 *                           type: string
 *                           example: public
 *                         createdAt:
 *                           type: string
 *                           example: 2023-01-01T00:00:00Z
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     viewers:
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
 *       404:
 *         description: Story not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:storyId/viewers', authenticate, isActive, getViewers);

/**
 * @swagger
 * /api/v1/stories/{storyId}/like:
 *   post:
 *     summary: Like or Unlike a story
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
  '/:storyId/like',
  authenticate,
  isActive,
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
 *       404:
 *         description: Story not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:storyId/likes', authenticate, isActive, storyLikes);

/**
 * @swagger
 * /api/v1/stories/{storyId}/like:
 *   patch:
 *     summary: Change reaction on a story
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
router.patch('/:storyId/like', authenticate, isActive, changeStoryReact);

export default router;
