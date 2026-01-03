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
import { isTargetUserAvailable } from '@/middlewares/isTargetUserAvailable';
import { getUserById } from '@/controllers/User/getUserById';
import { getUserFollowers } from '@/controllers/User/getUserFollowers';
import { getUserFollowings } from '@/controllers/User/getUserFollowing';
import { getUserByUsername } from '@/controllers/User/getUserByUsername';
import { mutualFollowers } from '@/controllers/follow/mutualFollowers';
import { mutualFollowings } from '@/controllers/follow/mutualFollowings';
import { isFollower } from '@/middlewares/isFollower';

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

router.get('/:id', authenticate, isActive, isTargetUserAvailable, getUserById);
router.get('/username/:username', authenticate, isActive, getUserByUsername);

router.post(
  '/follow/:id',
  authenticate,
  isActive,
  isTargetUserAvailable,
  follow,
);
router.delete(
  '/follow/:id',
  authenticate,
  isActive,
  isTargetUserAvailable,
  unfollow,
);
router.patch(
  '/followReq/:id',
  authenticate,
  isActive,
  isTargetUserAvailable,
  accept,
);
router.delete('/followReq/:id', authenticate, isActive, reject);
router.delete('/cancelFollowReq/:id', authenticate, isActive, cancelReq);

router.get(
  '/:id/followers',
  authenticate,
  isActive,
  isTargetUserAvailable,
  isFollower,
  getUserFollowers,
);
router.get(
  '/:id/followings',
  authenticate,
  isActive,
  isTargetUserAvailable,
  isFollower,
  getUserFollowings,
);
router.get(
  '/mutualFollowers/:id',
  authenticate,
  isActive,
  isTargetUserAvailable,
  isFollower,
  mutualFollowers,
);
router.get(
  '/mutualFollowings/:id',
  authenticate,
  isActive,
  isTargetUserAvailable,
  isFollower,
  mutualFollowings,
);
router.post('/block/:id', authenticate, isActive, block);
router.delete('/block/:id', authenticate, isActive, unblock);

export default router;
