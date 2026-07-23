import { getNotifications } from '@/controllers/notification/getNotifications ';
import { markAllAsRead } from '@/controllers/notification/markAllAsRead';
import { markOneAsRead } from '@/controllers/notification/markOneAsRead';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { validateRequest } from '@/middlewares/validation';
import { getNotificationsValidation } from '@/validation/notificationValidation';
import { Router } from 'express';

const router = Router();

router.get(
  '/',
  authenticate,
  isActive,
  validateRequest({ params: getNotificationsValidation }),
  getNotifications,
);

router.patch('/', authenticate, isActive, markAllAsRead);

router.patch('/:id', authenticate, isActive, markOneAsRead);

export default router;
