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
import { getUserFollowers } from '@/controllers/follow/getUserFollowers';
import { getUserFollowings } from '@/controllers/follow/getUserFollowing';
import { getUserByUsername } from '@/controllers/User/getUserByUsername';
import { mutualFollowers } from '@/controllers/follow/mutualFollowers';
import { mutualFollowings } from '@/controllers/follow/mutualFollowings';
import { isFollower } from '@/middlewares/isFollower';
import { getMyFollowers } from '@/controllers/follow/getMyFollowers';
import { getMyFollowings } from '@/controllers/follow/getMyFollowings';
import { blockList } from '@/controllers/block/getMyBlockList';
import { suggestedFollowings } from '@/controllers/follow/suggestedFollowings';
import { searchUsers } from '@/controllers/User/searchForUsers';

const router = Router();

/**
 * @swagger
 * /api/v1/users/myProfile:
 *   get:
 *     summary: Get current user's profile
 *     description: Retrieve the profile information of the currently authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile returned successfully
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
 *                     userInfo:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d0fe4f5311236168a109ca
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         username:
 *                           type: string
 *                           example: ahmed123
 *                         firstName:
 *                           type: string
 *                           example: Ahmed
 *                         lastName:
 *                           type: string
 *                           example: Salah
 *                         profilePic:
 *                           type: string
 *                           example: https://example.com/profile.jpg
 *                         coverPhoto:
 *                           type: string
 *                           example: https://example.com/cover.jpg
 *                         about:
 *                           type: string
 *                           example: This is Ahmed's bio.
 *                         followersCount:
 *                           type: integer
 *                           example: 100
 *                         followingsCount:
 *                           type: integer
 *                           example: 50
 *                         public:
 *                           type: boolean
 *                           example: true
 *                         education:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               school:
 *                                 type: string
 *                                 example: University of Example
 *                               level:
 *                                 type: string
 *                                 example: Bachelor's Degree
 *                         experience:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               company:
 *                                 type: string
 *                                 example: Example Company
 *                               title:
 *                                 type: string
 *                                 example: Software Engineer
 *                               from:
 *                                 type: string
 *                                 example: 2018-01-01T00:00:00.000Z
 *                               to:
 *                                 type: string
 *                                 example: 2021-12-31T23:59:59.999Z
 *                         birthday:
 *                           type: string
 *                           example: 1990-01-01T00:00:00.000Z
 *                         gender:
 *                           type: string
 *                           example: male
 *                         currentCity:
 *                           type: string
 *                           example: Cairo
 *                         hometown:
 *                           type: string
 *                           example: Alexandria
 *                         socialLinks:
 *                           type: object
 *                           example:
 *                             facebook: https://facebook.com/ahmed123
 *                             twitter: https://twitter.com/ahmed123
 *                         createdAt:
 *                           type: string
 *                           example: 2021-06-15T12:00:00.000Z
 *                         updatedAt:
 *                           type: string
 *                           example: 2021-06-15T12:00:00.000Z
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get('/myProfile', authenticate, isActive, getMe);

/**
 * @swagger
 * /api/v1/users/followers:
 *   get:
 *     summary: Get followers of current user
 *     description: Retrieve a list of followers for the currently authenticated user.
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          default: 20
 *     responses:
 *       200:
 *         description: List of followers
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
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     length:
 *                       type: integer
 *                       example: 100
 *                     followers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           follower:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                                 example: ahmed123
 *                               profilePhoto:
 *                                 type: string
 *                                 example: https://example.com/profile.jpg
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/followers', authenticate, isActive, getMyFollowers);

/**
 * @swagger
 * /api/v1/users/followings:
 *   get:
 *     summary: Get followings of current user
 *     description: Retrieve a list of followings for the currently authenticated user.
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          default: 20
 *     responses:
 *       200:
 *         description: List of followings
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
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     length:
 *                       type: integer
 *                       example: 100
 *                     followings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           following:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                                 example: ahmed123
 *                               profilePhoto:
 *                                 type: string
 *                                 example: https://example.com/profile.jpg
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/followings', authenticate, isActive, getMyFollowings);

/**
 * @swagger
 * /api/v1/users/deleteMe:
 *   patch:
 *     summary: Deactivate current user's account
 *     description: Deactivate the account of the currently authenticated user. This action is reversible and the user can reactivate their account later.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *      204:
 *       description: Account deactivated successfully
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Success'
 *
 */
router.patch('/deleteMe', authenticate, isActive, deleteMe);

/**
 * @swagger
 * /api/v1/users/activeMe:
 *   patch:
 *     summary: Reactivate current user's account
 *     description: Reactivate the account of the currently authenticated user if it was previously deactivated.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *      200:
 *       description: Account reactivated successfully
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Success'
 */
router.patch('/activeMe', authenticate, activeMe);

/**
 * @swagger
 * /api/v1/users/uploadCover:
 *   patch:
 *    summary: Upload or update cover photo
 *    description: Upload a new cover photo or update the existing one for the currently authenticated user.
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              coverPhoto:
 *                type: string
 *                format: binary
 *    responses:
 *      200:
 *        description: Cover photo uploaded/updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Success'
 *      400:
 *        description: Bad request (e.g., invalid file type).
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      404:
 *        description: photo not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
router.patch(
  '/uploadCover',
  authenticate,
  isActive,
  upload.single('coverPhoto'),
  uploadCoverPhoto,
);

/**
 * @swagger
 * /api/v1/users/uploadProfilePic:
 *   patch:
 *    summary: Upload or update profile photo
 *    description: Upload a new profile photo or update the existing one for the currently authenticated user.
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *            type: object
 *            properties:
 *              profilePhoto:
 *                type: string
 *                format: binary
 *    responses:
 *      200:
 *        description: Profile photo uploaded/updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Success'
 *      400:
 *        description: Bad request (e.g., invalid file type).
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      404:
 *        description: photo not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
router.patch(
  '/uploadProfilePic',
  authenticate,
  isActive,
  upload.single('profilePhoto'),
  uploadProfilePic,
);

/**
 * @swagger
 * /api/v1/users/updateInfo:
 *   patch:
 *     summary: Update profile information
 *     description: Update the profile information of the currently authenticated user, such as name, bio, education, experience, etc.
 *     tags: [Users]
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 optional: true
 *               firstName:
 *                 type: string
 *                 optional: true
 *               lastName:
 *                 type: string
 *                 optional: true
 *               about:
 *                 type: string
 *                 optional: true
 *               education:
 *                 type: string
 *                 optional: true
 *               experience:
 *                 type: string
 *                 optional: true
 *               birthday:
 *                 type: string
 *                 format: date
 *                 optional: true
 *     responses:
 *       200:
 *         description: Profile information updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request (e.g., invalid input data).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/updateInfo', authenticate, isActive, updateProfileInfo);

/**
 * @swagger
 * /api/v1/users/searchUsers:
 *   get:
 *     summary: Search for users
 *     description: Search for users by their username or name. This endpoint allows you to find users based on a search query.
 *     tags: [Users]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: text
 *        schema:
 *          type: string
 *          example: ahmed
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          example: 1
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          example: 10
 *     responses:
 *       200:
 *         description: List of users matching the search query
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
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                             example: ahmed123
 *                           firstName:
 *                             type: string
 *                             example: Ahmed
 *                           lastName:
 *                             type: string
 *                             example: Salah
 *                           profilePhoto:
 *                             type: string
 *                             example: https://example.com/profile.jpg
 *                           score:
 *                             type: number
 *                             example: 1.5
 *       400:
 *         description: Bad request (e.g., missing search query).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/searchUsers', authenticate, isActive, searchUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve user information by his unique ID.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          example: 64c7c8f0f1b2c3d4e5f6a7b8
 *     responses:
 *       200:
 *         description: Current user profile returned successfully
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
 *                     userInfo:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d0fe4f5311236168a109ca
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         username:
 *                           type: string
 *                           example: ahmed123
 *                         firstName:
 *                           type: string
 *                           example: Ahmed
 *                         lastName:
 *                           type: string
 *                           example: Salah
 *                         profilePic:
 *                           type: string
 *                           example: https://example.com/profile.jpg
 *                         coverPhoto:
 *                           type: string
 *                           example: https://example.com/cover.jpg
 *                         about:
 *                           type: string
 *                           example: This is Ahmed's bio.
 *                         followersCount:
 *                           type: integer
 *                           example: 100
 *                         followingsCount:
 *                           type: integer
 *                           example: 50
 *                         public:
 *                           type: boolean
 *                           example: true
 *                         education:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               school:
 *                                 type: string
 *                                 example: University of Example
 *                               level:
 *                                 type: string
 *                                 example: Bachelor's Degree
 *                         experience:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               company:
 *                                 type: string
 *                                 example: Example Company
 *                               title:
 *                                 type: string
 *                                 example: Software Engineer
 *                               from:
 *                                 type: string
 *                                 example: 2018-01-01T00:00:00.000Z
 *                               to:
 *                                 type: string
 *                                 example: 2021-12-31T23:59:59.999Z
 *                         birthday:
 *                           type: string
 *                           example: 1990-01-01T00:00:00.000Z
 *                         gender:
 *                           type: string
 *                           example: male
 *                         currentCity:
 *                           type: string
 *                           example: Cairo
 *                         hometown:
 *                           type: string
 *                           example: Alexandria
 *                         socialLinks:
 *                           type: object
 *                           example:
 *                             facebook: https://facebook.com/ahmed123
 *                             twitter: https://twitter.com/ahmed123
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticate, isActive, isTargetUserAvailable, getUserById);

/**
 * @swagger
 * /api/v1/users/username/{username}:
 *  get:
 *    summary: Get user by username
 *    description: Retrieve user information by his unique username.
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: username
 *        schema:
 *          type: string
 *          example: ahmed123
 *    responses:
 *       200:
 *         description: Current user profile returned successfully
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
 *                     userInfo:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: 60d0fe4f5311236168a109ca
 *                         email:
 *                           type: string
 *                           example: user@example.com
 *                         username:
 *                           type: string
 *                           example: ahmed123
 *                         firstName:
 *                           type: string
 *                           example: Ahmed
 *                         lastName:
 *                           type: string
 *                           example: Salah
 *                         profilePic:
 *                           type: string
 *                           example: https://example.com/profile.jpg
 *                         coverPhoto:
 *                           type: string
 *                           example: https://example.com/cover.jpg
 *                         about:
 *                           type: string
 *                           example: This is Ahmed's bio.
 *                         followersCount:
 *                           type: integer
 *                           example: 100
 *                         followingsCount:
 *                           type: integer
 *                           example: 50
 *                         public:
 *                           type: boolean
 *                           example: true
 *                         education:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               school:
 *                                 type: string
 *                                 example: University of Example
 *                               level:
 *                                 type: string
 *                                 example: Bachelor's Degree
 *                         experience:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               company:
 *                                 type: string
 *                                 example: Example Company
 *                               title:
 *                                 type: string
 *                                 example: Software Engineer
 *                               from:
 *                                 type: string
 *                                 example: 2018-01-01T00:00:00.000Z
 *                               to:
 *                                 type: string
 *                                 example: 2021-12-31T23:59:59.999Z
 *                         birthday:
 *                           type: string
 *                           example: 1990-01-01T00:00:00.000Z
 *                         gender:
 *                           type: string
 *                           example: male
 *                         currentCity:
 *                           type: string
 *                           example: Cairo
 *                         hometown:
 *                           type: string
 *                           example: Alexandria
 *                         socialLinks:
 *                           type: object
 *                           example:
 *                             facebook: https://facebook.com/ahmed123
 *                             twitter: https://twitter.com/ahmed123
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/username/:username', authenticate, isActive, getUserByUsername);

/**
 * @swagger
 * /api/v1/users/follow/{id}:
 *   post:
 *     summary: Follow a user
 *     description: Follow a user by their ID.
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          example: 64c7c8f0f1b2c3d4e5f6a7b8
 *     responses:
 *       200:
 *         description: Successfully followed the user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Follow'
 *       400:
 *         description: Bad request (e.g., trying to follow yourself or already following the user).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/follow/:id',
  authenticate,
  isActive,
  isTargetUserAvailable,
  follow,
);

/**
 * @swagger
 * /api/v1/users/follow/{id}:
 *   delete:
 *    summary: Unfollow a user
 *    description: Unfollow a user by their ID.
 *    tags: [Follow]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          example: 64c7c8f0f1b2c3d4e5f6a7b8
 *    responses:
 *      204:
 *        description: Successfully unfollowed the user.
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Follow'
 *      400:
 *        description: Bad request (e.g., trying to unfollow yourself or not following the user).
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *      404:
 *        description: User not found
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
router.delete(
  '/follow/:id',
  authenticate,
  isActive,
  isTargetUserAvailable,
  unfollow,
);
/**
 * @swagger
 * /api/v1/users/followReq/{id}:
 *   patch:
 *     summary: Accept a follow request
 *     description: Accept a follow request from another user.
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          example: 64c7c8f0f1b2c3d4e5f6a7b8
 *     responses:
 *       200:
 *         description: Successfully accepted the follow request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Follow'
 *       400:
 *         description: Bad request (e.g., not receiving a follow request from the user).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Follow request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/followReq/:id',
  authenticate,
  isActive,
  isTargetUserAvailable,
  accept,
);

/**
 * @swagger
 * /api/v1/users/followReq/{id}:
 *   delete:
 *     summary: Reject a follow request
 *     description: Reject a follow request from another user.
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          example: 64c7c8f0f1b2c3d4e5f6a7b8
 *     responses:
 *       204:
 *         description: Successfully rejected the follow request.
 *       400:
 *         description: Bad request (e.g., not receiving a follow request from the user).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/followReq/:id', authenticate, isActive, reject);

/**
 * @swagger
 * /api/v1/users/cancelFollowReq/{id}:
 *   delete:
 *     summary: Cancel a sent follow request
 *     description: Cancel a follow request that the current user has sent to another user.
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example: 64c7c8f0f1b2c3d4e5f6a7b8
 *     responses:
 *       204:
 *         description: Successfully canceled the follow request.
 *       400:
 *         description: Bad request (e.g., not sending a follow request to the user).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/cancelFollowReq/:id', authenticate, isActive, cancelReq);

/**
 * @swagger
 * /api/v1/users/{id}/followers:
 *   get:
 *     summary: Get followers of a user
 *     description: Retrieve a list of followers for a specific user by their ID.
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          example: 64c7c8f0f1b2c3d4e5f6a7b8
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          default: 20
 *     responses:
 *       200:
 *         description: List of followers
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
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     length:
 *                       type: integer
 *                       example: 100
 *                     followers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           follower:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                                 example: ahmed123
 *                               profilePhoto:
 *                                 type: string
 *                                 example: https://example.com/profile.jpg
 *       400:
 *         description: Bad request (e.g., trying to access followings of a private user without being a follower).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id/followers',
  authenticate,
  isActive,
  isTargetUserAvailable,
  isFollower,
  getUserFollowers,
);

/**
 * @swagger
 * /api/v1/users/{id}/followings:
 *   get:
 *     summary: Get followings of a user
 *     description: Retrieve a list of followings for a specific user by his ID.
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          example: 64c7c8f0f1b2c3d4e5f6a7b8
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          default: 20
 *     responses:
 *       200:
 *         description: List of followings
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
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     length:
 *                       type: integer
 *                       example: 100
 *                     followings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           following:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                                 example: ahmed123
 *                               profilePhoto:
 *                                 type: string
 *                                 example: https://example.com/profile.jpg
 *       400:
 *         description: Bad request (e.g., trying to access followings of a private user without being a follower).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id/followings',
  authenticate,
  isActive,
  isTargetUserAvailable,
  isFollower,
  getUserFollowings,
);

/**
 * @swagger
 * /api/v1/users/mutualFollowers/{id}:
 *   get:
 *     summary: Get mutual followers with a user
 *     description: Retrieve a list of mutual followers between the current user and another user by his ID.
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          example: 64c7c8f0f1b2c3d4e5f6a7b8
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          default: 20
 *     responses:
 *       200:
 *         description: List of mutual followers
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
 *                     mutualFollowers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           follower:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                                 example: ahmed123
 *                               profilePhoto:
 *                                 type: string
 *                                 example: https://example.com/profile.jpg
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/mutualFollowers/:id',
  authenticate,
  isActive,
  isTargetUserAvailable,
  isFollower,
  mutualFollowers,
);

/**
 * @swagger
 * /api/v1/users/mutualFollowings/{id}:
 *   get:
 *     summary: Get mutual followings with a user
 *     description: Retrieve a list of mutual followings between the current user and another user by his ID.
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *          example: 64c7c8f0f1b2c3d4e5f6a7b8
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          default: 1
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          default: 20
 *     responses:
 *       200:
 *         description: List of mutual followings
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
 *                     mutualFollowings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           following:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                                 example: ahmed123
 *                               profilePhoto:
 *                                 type: string
 *                                 example: https://example.com/profile.jpg
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
router.get(
  '/mutualFollowings/:id',
  authenticate,
  isActive,
  isTargetUserAvailable,
  isFollower,
  mutualFollowings,
);

/**
 * @swagger
 * /api/v1/users/suggestedFollowings:
 *   get:
 *     summary: Get suggested followings
 *     description: Retrieve a list of suggested users to follow based on mutual connections and other factors.
 *     tags: [Follow]
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *     - in: query
 *       name: page
 *       schema:
 *         type: integer
 *         default: 1
 *     - in: query
 *       name: limit
 *       schema:
 *         type: integer
 *         default: 20
 *     responses:
 *       200:
 *         description: List of suggested followings
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
 *                     suggestedFollowings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               username:
 *                                 type: string
 *                                 example: ahmed123
 *                               profilePhoto:
 *                                 type: string
 *                                 example: https://example.com/profile.jpg
 *       401:
 *        description: Unauthorized
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
router.get(
  '/follow/suggestedFollowings',
  authenticate,
  isActive,
  suggestedFollowings,
);

/**
 * @swagger
 * /api/v1/users/block/{id}:
 *   post:
 *     summary: Block a user
 *     description: Block a user by their ID. Blocking a user will prevent them from interacting with you and viewing your profile.
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     responses:
 *       200:
 *         description: User blocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/success'
 *       400:
 *         description: Bad request (e.g., trying to block yourself or already blocking the user).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
router.post('/block/:id', authenticate, isActive, block);

/**
 * @swagger
 * /api/v1/users/unblock/{id}:
 *   delete:
 *     summary: Unblock a user
 *     description: Unblock a user by their ID. Unblocking a user will allow them to interact with you and view your profile again.
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           example: 1234567890abcdef12345678
 *     responses:
 *       200:
 *         description: User unblocked successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/success'
 *       400:
 *         description: Bad request (e.g., trying to unblock yourself or not blocking the user).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 */
router.delete('/block/:id', authenticate, isActive, unblock);

/**
 * @swagger
 * /api/v1/users/block/blockList:
 *   get:
 *     summary: Get blocked users list
 *     description: Retrieve a list of users that are blocked by the authenticated user.
 *     tags: [Blocks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Successfully retrieved blocked users list
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
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     length:
 *                       type: integer
 *                       example: 5
 *                     blockedUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           username:
 *                             type: string
 *                             example: salah123
 *                           profilePhoto:
 *                             type: string
 *                             example: https://example.com/profile.jpg
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *            schema:
 *              $ref: '#/components/schemas/Error'
 */
router.get('/block/blockList', authenticate, isActive, blockList);

export default router;
