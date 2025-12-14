import refreshAccessToken from '@/controllers/Auth/refreshAccessToken';
import { register } from '@/controllers/Auth/register';
import { Router } from 'express';

const router = Router();
router.post('/register', register);
router.post('/refreshToken', refreshAccessToken);

export default router;
