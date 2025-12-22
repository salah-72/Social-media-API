import { deleteMe } from '@/controllers/User/deleteMe';
import { getMe } from '@/controllers/User/getMe';
import { activeMe } from '@/controllers/User/activeMe';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { Router } from 'express';
import { uploadCoverPhoto } from '@/controllers/User/uploadCoverPhoto';
import { upload } from '@/middlewares/multer';

const router = Router();
router.get('/myProfile', authenticate, isActive, getMe);
router.patch('/deleteMe', authenticate, isActive, deleteMe);
router.patch('/activeMe', authenticate, activeMe);
router.patch(
  '/uploadCover',
  authenticate,
  isActive,
  upload.single('coverPhoto'),
  uploadCoverPhoto,
);

export default router;
