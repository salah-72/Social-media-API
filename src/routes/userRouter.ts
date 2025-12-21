import { getMe } from '@/controllers/User/getMe';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { Router } from 'express';

const router = Router();
router.get('/myProfile', authenticate, isActive, getMe);

export default router;
