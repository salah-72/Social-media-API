import { getNotifications } from '@/controllers/notification/getNotifications ';
import { markAllAsRead } from '@/controllers/notification/markAllAsRead';
import { markOneAsRead } from '@/controllers/notification/markOneAsRead';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { validateRequest } from '@/middlewares/validation';
import { getNotificationsValidation } from '@/validation/notificationValidation';
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get paginated list of user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of notifications per page
 *     responses:
 *       200:
 *         description: Successfully fetched notifications
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64f1a2b3c4d5e6f7a8b9c0d1
 *                           type:
 *                             type: string
 *                             enum: [follow, follow_request, like, comment, comment_reply]
 *                             example: like
 *                           isRead:
 *                             type: boolean
 *                             example: false
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           post:
 *                             type: string
 *                             nullable: true
 *                           comment:
 *                             type: string
 *                             nullable: true
 *                           story:
 *                             type: string
 *                             nullable: true
 *                           sender:
 *                             type: object
 *                             nullable: true
 *                             properties:
 *                               username:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               profilePhoto:
 *                                 type: string
 *                     unreadCount:
 *                       type: integer
 *                       example: 5
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
 *                       example: 45
 *                     noOfPages:
 *                       type: integer
 *                       example: 2
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Forbidden - User account is inactive or blocked
 */

router.get(
  '/',
  authenticate,
  isActive,
  validateRequest({ query: getNotificationsValidation }),
  getNotifications,
);

/**
 * @swagger
 * /api/v1/notifications:
 *   patch:
 *     summary: Mark all unread notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: notifications marked as read
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Inactive account
 */
router.patch('/', authenticate, isActive, markAllAsRead);

/**
 * @swagger
 * /api/v1/notifications/{id}:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *         example: 64f1a2b3c4d5e6f7a8b9c0d1
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */
router.patch('/:id', authenticate, isActive, markOneAsRead);

export default router;
