import Router from 'express';
import { sendMessage } from '@/controllers/message/sendMessage';
import { deleteMessage } from '@/controllers/message/deleteMessage';
import {
  sendMessageValidation,
  IdParamValidation,
  getConversationsValidation,
  searchMessagesValidation,
  createGroupValidation,
  addGroupMemberValidation,
  updateGroupInfoValidation,
  removeGroupMemberValidation,
} from '@/validation/messageValidation';
import { validateRequest } from '@/middlewares/validation';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { isTargetUserAvailable } from '@/middlewares/isTargetUserAvailable';
import { upload } from '@/middlewares/multer';
import { rateLimit } from '@/middlewares/rateLimit';
import { getConversations } from '@/controllers/message/getCoversations';
import { getMessages } from '@/controllers/message/getMessages';
import { markConversationRead } from '@/controllers/message/markConversationRead';
import { searchMessages } from '@/controllers/message/searchMessages';
import { createGroup } from '@/controllers/message/createGroup';
import { addGroupMember } from '@/controllers/message/addGroupMember';
import { getGroupInfo } from '@/controllers/message/getGroupInfo';
import { updateGroupInfo } from '@/controllers/message/updateGroupInfo';
import { removeGroupMember } from '@/controllers/message/removeGroupMember';
import { sendGroupMessage } from '@/controllers/message/sendGroupMessage';

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
 * /api/v1/messages/groups:
 *   post:
 *     summary: Create a group conversation (creator becomes the first admin)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, memberIds]
 *             properties:
 *               name:
 *                 type: string
 *               memberIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Everyone else in the group - at least 2 (a group needs 3+ total)
 *     responses:
 *       201:
 *         description: Group created
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
 *                     conversations:
 *                       type: object
 *                       properties:
 *                         participants:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: 69ef462cc0c7b023c9fa5607
 *                         isGroup:
 *                           type: boolean
 *                         groupName:
 *                           type: string
 *                         groupAdmins:
 *                           type: array
 *                           items:
 *                             type: string
 *                             example: 69ef462cc0c7b023c9fa5607
 *                         createdBy:
 *                           type: string
 *                           example: 69ef462cc0c7b023c9fa5607
 *                         _id:
 *                           type: string
 *                           example: 6aa6708774519669edc61c3c
 *                         createdAt:
 *                           type: string
 *                           example: 2026-09-13T09:44:39.520Z
 *       400:
 *         description: Fewer than 2 other members
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: A member is blocked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: A member was not found, inactive, or unverified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/groups',
  authenticate,
  isActive,
  validateRequest({ body: createGroupValidation }),
  createGroup,
);

/**
 * @swagger
 * /api/v1/messages/search:
 *   get:
 *     summary: Search your own message history by keyword
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
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
 *         description: Matching messages, most recent first
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
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64a7b8f8e4b0c2a1d8f9c1a2
 *                           conversation:
 *                             type: string
 *                             example: 64a7b8f8e4b0c2a1d8f9c1a2
 *                           sender:
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
 *                             example: Hello, how are you?
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2023-07-01T12:34:56.789Z
 *       401:
 *         description: Unauthorized - user not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/search',
  authenticate,
  isActive,
  validateRequest({ query: searchMessagesValidation }),
  searchMessages,
);

/**
 * @swagger
 * /api/v1/messages/{id}:
 *   get:
 *     summary: Get messages in a conversation, newest to oldest
 *     tags: [Messages]
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
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Paginated messages
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
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64a7b8f8e4b0c2a1d8f9c1a2
 *                           conversation:
 *                             type: string
 *                             example: 64a7b8f8e4b0c2a1d8f9c1a2
 *                           sender:
 *                             type: string
 *                             example: 64a7b8f8e4b0c2a1d8f9c1a2
 *                           content:
 *                             type: string
 *                             example: Hello, how are you?
 *                           image:
 *                             type: string
 *                             example: https://example.com/image.jpg
 *                           readAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2023-07-01T12:34:56.789Z
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2023-07-01T12:34:56.789Z
 *       403:
 *         description: Not a participant in this conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  authenticate,
  isActive,
  validateRequest({
    params: IdParamValidation,
    query: getConversationsValidation,
  }),
  getMessages,
);

/**
 * @swagger
 * /api/v1/messages/groups/{id}/info:
 *   get:
 *     summary: Get a group's details and member list
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group details
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
 *                     conversation:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 6aa02310ed892f5a39ea4ba0
 *                         groupName:
 *                           type: string
 *                           example: safwa
 *                         groupPhoto:
 *                           type: object
 *                           properties:
 *                             url:
 *                               type: string
 *                               example: https://res.cloudinary.com/dfemcxcob/image/upload/v1788944379/img/yz2unmwcniotjicutzae.jpg
 *                             publicId:
 *                               type: string
 *                               example: img/yz2unmwcniotjicutzae
 *                         createdBy:
 *                           type: string
 *                           example: 69ef462cc0c7b023c9fa5607
 *                         createdAt:
 *                           type: string
 *                           example: 2026-09-08T15:00:32.679Z
 *                         members:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 69ef462cc0c7b023c9fa5607
 *                               isAdmin:
 *                                 type: boolean
 *                                 example: true
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
 *       403:
 *         description: Not a member of this group
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/groups/:id/info',
  authenticate,
  isActive,
  validateRequest({ params: IdParamValidation }),
  getGroupInfo,
);

/**
 * @swagger
 * /api/v1/messages/groups/{id}:
 *   post:
 *     summary: Send a message to a group
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: hi
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Message sent
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
 *                     message:
 *                       type: object
 *                       properties:
 *                         conversation:
 *                           type: string
 *                           example: 69ef462cc0c7b023c9fa5607
 *                         sender:
 *                           type: string
 *                           example: 69ef462cc0c7b023c9fa5607
 *                         content:
 *                           type: string
 *                           example: hi
 *                         _id:
 *                           type: string
 *                           example: 69ef462cc0c7b023c9fa5607
 *                         createdAt:
 *                           type: string
 *                           example: 2026-09-08T15:00:32.679Z
 *                     coversationId:
 *                       type: string
 *                       example: 69ef462cc0c7b023c9fa5607
 *       403:
 *         description: Not a member of this group
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/groups/:id',
  authenticate,
  isActive,
  sendMessageLimiter,
  upload.single('image'),
  validateRequest({
    params: IdParamValidation,
    body: sendMessageValidation,
  }),
  sendGroupMessage,
);

/**
 * @swagger
 * /api/v1/messages/groups/{id}:
 *   patch:
 *     summary: Update a group's name and/or photo (admin only)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated
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
 *                     conversation:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 6aa02310ed892f5a39ea4ba0
 *                         isGroup:
 *                           type: boolean
 *                           example: true
 *                         groupName:
 *                           type: string
 *                           example: safwa
 *                         groupPhoto:
 *                           type: object
 *                           properties:
 *                             url:
 *                               type: string
 *                               example: https://res.cloudinary.com/dfemcxcob/image/upload/v1788944379/img/yz2unmwcniotjicutzae.jpg
 *                             publicId:
 *                               type: string
 *                               example: img/yz2unmwcniotjicutzae
 *                         participants:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example:
 *                             - 69ef462cc0c7b023c9fa5607
 *                             - 69ee36aec636be6333be1bd0
 *                             - 69ef452bbfc5e646a3cf291f
 *                         groupAdmins:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example:
 *                             - 69ef462cc0c7b023c9fa5607
 *                         createdBy:
 *                           type: string
 *                           example: 69ef462cc0c7b023c9fa5607
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-09-08T15:00:32.679Z
 *                         __v:
 *                           type: integer
 *                           example: 2
 *                         lastMessage:
 *                           type: string
 *                           example: ss
 *                         lastMessageAt:
 *                           type: string
 *                           format: date-time
 *                           example: 2026-09-13T10:54:45.707Z
 *                         lastMessageSender:
 *                           type: string
 *                           example: 69ef462cc0c7b023c9fa5607
 *       403:
 *         description: Not a group admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Group not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/groups/:id/info',
  authenticate,
  isActive,
  upload.single('image'),
  validateRequest({
    params: IdParamValidation,
    body: updateGroupInfoValidation,
  }),
  updateGroupInfo,
);
/**
 * @swagger
 * /api/v1/messages/groups/{conversationId}/members:
 *   post:
 *     summary: Add a member to a group (admin only)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Member added
 *       403:
 *         description: Not a group admin, or the member is blocked
 *       404:
 *         description: Group or user not found
 */
router.post(
  '/groups/:id/members',
  authenticate,
  isActive,
  validateRequest({
    params: IdParamValidation,
    body: addGroupMemberValidation,
  }),
  addGroupMember,
);

/**
 * @swagger
 * /api/v1/messages/groups/{conversationId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a group, or leave it yourself
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Pass your own id to leave the group
 *     responses:
 *       204:
 *         description: Removed
 *       403:
 *         description: Only a group admin can remove other members
 *       404:
 *         description: Group not found, or user is not a member
 */
router.delete(
  '/groups/:id/members/:memberId',
  authenticate,
  isActive,
  validateRequest({ params: removeGroupMemberValidation }),
  removeGroupMember,
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
    params: IdParamValidation,
    body: sendMessageValidation,
  }),
  sendMessage,
);

/**
 * @swagger
 * /api/v1/messages/{messageId}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: message deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Invalid message id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Message not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:id',
  authenticate,
  isActive,
  validateRequest({ params: IdParamValidation }),
  deleteMessage,
);

/**
 * @swagger
 * /api/v1/messages/{id}/read:
 *   patch:
 *     summary: Mark every message the other participant sent as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Not a participant in this conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/:id/read',
  authenticate,
  isActive,
  validateRequest({ params: IdParamValidation }),
  markConversationRead,
);
export default router;
