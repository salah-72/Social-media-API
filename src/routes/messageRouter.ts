import Router from 'express';
import { sendMessage } from '@/controllers/message/sendMessage';
import {
  sendMessageValidation,
  userIdParamValidation,
  getConversationsValidation,
} from '@/validation/messageValidation';
import { validateRequest } from '@/middlewares/validation';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { isTargetUserAvailable } from '@/middlewares/isTargetUserAvailable';
import { upload } from '@/middlewares/multer';
import { rateLimit } from '@/middlewares/rateLimit';
import { getConversations } from '@/controllers/message/getCoversations';

const router = Router();

const sendMessageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Too many messages, please slow down',
});

/**
 * @swagger
 * /api/v1/messages:
 *   get:
 *     summary: List the current user's conversations, most recent first
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of conversations with last message preview and unread count
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
 *                     conversations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64a7b8f8e4b0c2a1d8f9c1a2
 *                           otherUser:
 *                             type: object
 *                             properties:
 *                               username:
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
 *                           lastMessage:
 *                             type: string
 *                             example: Hello, how are you?
 *                           lastMessageAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2023-07-01T12:34:56.789Z
 *                           lastMessageSender:
 *                             type: string
 *                             example: 64a7b8f8e4b0c2a1d8f9c1a2
 *                           unreadCount:
 *                             type: integer
 *                             example: 2
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  authenticate,
  isActive,
  validateRequest({ query: getConversationsValidation }),
  getConversations,
);

/**
 * @swagger
 * /api/v1/messages/{id}:
 *   post:
 *     summary: Send a message to a user (creates the conversation on first message)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipient's user id
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Message sent
 *       400:
 *         description: Missing content/image, or trying to message yourself
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Recipient not found, inactive, or blocked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:id',
  authenticate,
  isActive,
  sendMessageLimiter,
  isTargetUserAvailable,
  upload.single('image'),
  validateRequest({
    params: userIdParamValidation,
    body: sendMessageValidation,
  }),
  sendMessage,
);
export default router;
