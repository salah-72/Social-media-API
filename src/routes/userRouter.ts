import { deleteMe } from '@/controllers/User/deleteMe';
import { getMe } from '@/controllers/User/getMe';
import { activeMe } from '@/controllers/User/reActiveMe';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { Router } from 'express';

const router = Router();
router.get('/myProfile', authenticate, isActive, getMe);
router.patch('/deleteMe', authenticate, isActive, deleteMe);
router.patch('/activeMe', authenticate, activeMe);

export default router;
