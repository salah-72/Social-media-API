import { emailVerification } from '@/controllers/Auth/emailVerification';
import refreshAccessToken from '@/controllers/Auth/refreshAccessToken';
import { register } from '@/controllers/Auth/register';
import { Router } from 'express';

const router = Router();
router.post('/register', register);
router.post('/refreshToken', refreshAccessToken);
router.get('/verify/:token', emailVerification);

export default router;
