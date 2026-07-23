import { getNotifications } from '@/controllers/notification/getNotifications ';
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

export default router;
