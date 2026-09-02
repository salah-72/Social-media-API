import Router from 'express';
import { sendMessage } from '@/controllers/message/sendMessage';
import {
  sendMessageValidation,
  userIdParamValidation,
} from '@/validation/messageValidation';
import { validateRequest } from '@/middlewares/validation';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { isTargetUserAvailable } from '@/middlewares/isTargetUserAvailable';
import { upload } from '@/middlewares/multer';
import { rateLimit } from '@/middlewares/rateLimit';

const router = Router();

const sendMessageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Too many messages, please slow down',
});

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
 *       404:
 *         description: Recipient not found, inactive, or blocked
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
