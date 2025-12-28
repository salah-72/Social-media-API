import { deleteMe } from '@/controllers/User/deleteMe';
import { getMe } from '@/controllers/User/getMe';
import { activeMe } from '@/controllers/User/activeMe';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { Router } from 'express';
import { uploadCoverPhoto } from '@/controllers/User/uploadCoverPhoto';
import { upload } from '@/middlewares/multer';
import { uploadProfilePic } from '@/controllers/User/uploadProfilePic';
import { updateProfileInfo } from '@/controllers/User/updateProfile';
import { follow } from '@/controllers/follow/follow';

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
router.patch(
  '/uploadProfilePic',
  authenticate,
  isActive,
  upload.single('profilePhoto'),
  uploadProfilePic,
);
router.patch('/updateInfo', authenticate, isActive, updateProfileInfo);

router.post('/follow/:id', authenticate, isActive, follow);

export default router;
