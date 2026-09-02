import express, { urlencoded } from 'express';
import mongoose from 'mongoose';
import type { CorsOptions } from 'cors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import config from './config/config';
import { logger } from './lib/winston';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@/utils/swagger';
import authRouter from '@/routes/authRouter';
import userRouter from '@/routes/userRouter';
import postRouter from '@/routes/postRouter';
import storyRouter from '@/routes/storyRouter';
import messageRouter from '@/routes/messageRouter';
import notificationRouter from '@/routes/notificationRouter';
import errorHandler from './middlewares/errorHandler';
import passport from 'passport';
import { rateLimit } from '@/middlewares/rateLimit';
import './jobs/node_cron';
import '@/utils/redis';
import redisClient from '@/utils/redis';

const app = express();

app.set('trust proxy', true);

mongoose
  .connect(config.DB_CONNECTION as string)
  .then(() => {
    logger.info('good connection to DB');
  })
  .catch((err) => {
    logger.error('failed to connect to the DB', err);
  });

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (config.NODE_ENV === 'development') return callback(null, true);

    if (origin === config.CLIENT_URL) {
      return callback(null, true);
    }

    logger.warn(`CORS error: ${origin} is not allowed by CORS`);
    callback(new Error(`CORS error: ${origin} is not allowed by CORS`), false);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression({ threshold: 1024 }));
app.use(helmet());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later',
  skip: (req) => req.path.startsWith('/api-docs'),
});

app.use('/api', globalLimiter);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health endpoint
 *     description: Check the health of the application
 *     responses:
 *       200:
 *         description: Application is healthy
 *       500:
 *         description: Application is down
 */
app.get('/health', async (req, res) => {
  const isMongoConnected = mongoose.connection.readyState === 1;
  const isRedisConnected = redisClient.isReady;

  if (isMongoConnected && isRedisConnected) {
    return res
      .status(200)
      .json({ status: 'UP', mongo: 'connected', redis: 'connected' });
  }

  return res
    .status(500)
    .json({ status: 'DOWN', mongo: isMongoConnected, redis: isRedisConnected });
});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Documentation',
  }),
);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/post', postRouter);
app.use('/api/v1/story', storyRouter);
app.use('/api/v1/notification', notificationRouter);
app.use('/api/v1/messages', messageRouter);

app.use(errorHandler);

export default app;
