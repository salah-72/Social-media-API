import { getActiveSessions } from '@/controllers/Auth/activeSessions';
import { emailVerification } from '@/controllers/Auth/emailVerification';
import { forgetPassword } from '@/controllers/Auth/forgetPassword';
import { login } from '@/controllers/Auth/login';
import { logOut, logoutAll } from '@/controllers/Auth/logOut';
import refreshToken from '@/controllers/Auth/refreshToken';
import { register } from '@/controllers/Auth/register';
import { resetPassword } from '@/controllers/Auth/resetPassword';
import { googleAuthCallback } from '@/controllers/Auth/signinWithGoogle';
import { updatePassword } from '@/controllers/Auth/updatePassword';
import { authenticate } from '@/middlewares/authenticate';
import { isActive } from '@/middlewares/isActive';
import { validateRequest } from '@/middlewares/validation';
import {
  forgotPasswordValidation,
  loginValidation,
  registerValidation,
  tokenValidation,
  updatePasswordValidation,
} from '@/validation/authValidation';
import { Router } from 'express';
import passport from 'passport';

const router = Router();
/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongPassword123
 *               firstName:
 *                 type: string
 *                 example: Ahmed
 *               lastName:
 *                 type: string
 *                 example: Salah
 *     responses:
 *       201:
 *         description: User registered successfully
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
 *                     _id:
 *                       type: string
 *                       example: 60d0fe4f5311236168a109ca
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     username:
 *                       type: string
 *                       example: ahmed123
 *                     firstName:
 *                       type: string
 *                       example: Ahmed
 *                     lastName:
 *                       type: string
 *                       example: Salah
 *                     emailVerified:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/signup', validateRequest({ body: registerValidation }), register);

/**
 * @swagger
 * /api/v1/auth/sessions:
 *   get:
 *     summary: Get active sessions
 *     description: Retrieve a list of active sessions for the authenticated user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Active sessions retrieved successfully
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
 *                     activeSessions:
 *                       type: array
 *                       items:
 *                         type: object

 */
router.get('/sessions', authenticate, isActive, getActiveSessions);

/**
 * @swagger
 * /api/v1/auth/refreshToken:
 *   post:
 *     summary: Refresh access token
 *     description: Use a valid refresh token to obtain a new access token. The refresh token can be sent in the request body or as an HTTP-only cookie.
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token (optional if sent via cookie)
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 accessToken:
 *                   type: string
 *                   description: New JWT access token
 *       400:
 *         description: Refresh token is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/refreshToken', refreshToken);

/**
 * @swagger
 * /api/v1/auth/verify/{token}:
 *   get:
 *     summary: Verify user email address
 *     description: Verify a user's email address using a verification token sent to their email.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           required: true
 *         description: The email verification token sent to user's email
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/verify/:token',
  validateRequest({ params: tokenValidation }),
  emailVerification,
);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate user and return access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               username:
 *                 type: string
 *                 example: ahmed123
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongPassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             description: Refresh token cookie
 *             schema:
 *               type: string
 *               example: refreshToken=abc123; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth
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
 *                     _id:
 *                       type: string
 *                       example: 60d0fe4f5311236168a109ca
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     username:
 *                       type: string
 *                       example: ahmed123
 *                     firstName:
 *                       type: string
 *                       example: Ahmed
 *                     lastName:
 *                       type: string
 *                       example: Salah
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: User not found or password is incorrect - Email not verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', validateRequest({ body: loginValidation }), login);

/**
 * @swagger
 * /api/v1/auth/signin:
 *   get:
 *     summary: Initiate Google OAuth login
 *     description: Redirects the user to Google login page to authenticate.
 *     tags: [Auth]
 *     responses:
 *       302:
 *         description: Redirects to Google
 */
router.get(
  '/signin',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Handle the response from Google after user authentication.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Authentication successful
 *       302:
 *         description: Redirects to frontend with access/refresh tokens
 */
router.get('/google/callback', googleAuthCallback);

/**
 * @swagger
 * /api/v1/auth/forgetPassword:
 *   post:
 *     summary: Send password reset link
 *     description: Send a password reset link to the user's email address if it exists in the system.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Bad request - Missing email field
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User with this email does not exist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/forgetPassword',
  validateRequest({ body: forgotPasswordValidation }),
  forgetPassword,
);

/**
 * @swagger
 * /api/v1/auth/reset/{token}:
 *   post:
 *     summary: Reset password using token
 *     description: Reset the user's password using a valid reset token.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: The password reset token received in email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: NewStrongPass123!
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: NewStrongPass123!
 *     responses:
 *       200:
 *         description: Password has been reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Passwords do not match or token is invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/reset/:token',
  validateRequest({ params: tokenValidation }),
  resetPassword,
);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidates the user session (clears cookies/tokens).
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logout', authenticate, isActive, logOut);

/**
 * @swagger
 * /api/v1/auth/logoutAll:
 *   post:
 *     summary: Logout user from all devices
 *     description: Invalidates the user session on all devices (clears cookies/tokens).
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/logoutAll', authenticate, isActive, logoutAll);

/**
 * @swagger
 * /api/v1/auth/updatePassword:
 *   patch:
 *     summary: Update user password
 *     description: Updates the password of the currently logged-in user.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: OldPass123!
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPass456!
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPass456!
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Current password incorrect or new passwords do not match
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
router.patch(
  '/updatePassword',
  authenticate,
  isActive,
  validateRequest({ body: updatePasswordValidation }),
  updatePassword,
);
export default router;
