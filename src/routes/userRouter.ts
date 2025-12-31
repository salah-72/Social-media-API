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
import { accept } from '@/controllers/follow/acceptFollow';
import { reject } from '@/controllers/follow/rejectFollow';
import { unfollow } from '@/controllers/follow/unfollow';
import { cancelReq } from '@/controllers/follow/cancelRequest';
import { block } from '@/controllers/block/block';
import { unblock } from '@/controllers/block/unblock';

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
router.delete('/follow/:id', authenticate, isActive, unfollow);
router.patch('/followReq/:id', authenticate, isActive, accept);
router.delete('/followReq/:id', authenticate, isActive, reject);
router.delete('/cancelFollowReq/:id', authenticate, isActive, cancelReq);

router.post('/block/:id', authenticate, isActive, block);
router.delete('/block/:id', authenticate, isActive, unblock);

export default router;
