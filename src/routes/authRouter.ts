import { emailVerification } from '@/controllers/Auth/emailVerification';
import { forgetPassword } from '@/controllers/Auth/forgetPassword';
import { login } from '@/controllers/Auth/login';
import refreshAccessToken from '@/controllers/Auth/refreshAccessToken';
import { register } from '@/controllers/Auth/register';
import { resetPassword } from '@/controllers/Auth/resetPassword';
import { googleAuthCallback } from '@/controllers/Auth/signinWithGoogle';
import { Router } from 'express';
import passport from 'passport';

const router = Router();
router.post('/register', register);
router.post('/refreshToken', refreshAccessToken);
router.get('/verify/:token', emailVerification);
router.post('/login', login);
router.get(
  '/signin',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);
router.get('/google/callback', googleAuthCallback);
router.post('/forgetPassword', forgetPassword);
router.post('/reset/:token', resetPassword);
export default router;
