import express, { urlencoded } from 'express';
import mongoose from 'mongoose';
import type { CorsOptions } from 'cors';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import config from './config/config';
import { logger } from './lib/winston';
import authRouter from '@/routes/authRouter';
import userRouter from '@/routes/userRouter';
import postRouter from '@/routes/postRouter';
import errorHandler from './middlewares/errorHandler';
import passport from 'passport';

const app = express();

mongoose
  .connect(config.DB_CONNECTION as string)
  .then(() => {
    logger.info('good connection to DB');
  })
  .catch((err) => {
    logger.error('failed to connect rhe DB', err);
  });

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (config.NODE_ENV === 'development' || !origin) {
      callback(null, true);
    } else {
      callback(
        new Error(`CORS error: ${origin} is not allowed by CORS`),
        false,
      );
      logger.warn(`CORS error: ${origin} is not allowed by CORS`);
    }
  },
};

const limiter = rateLimit({
  limit: 60,
  windowMs: 30000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'too many requests from same ip, try again later',
  },
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression({ threshold: 1024 }));
app.use(helmet());

app.get('/api/v1', (req, res) => {
  res.send('welcome to our social media api');
});
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/post', postRouter);

app.use(errorHandler);
app.listen(config.PORT, () => {
  logger.info(`app is running at port ${config.PORT}`);
});

const handleServerShutdown = async () => {
  try {
    logger.warn('Server SHUTDOWN');
    process.exit(0);
  } catch (err) {
    logger.error('Error during server shutdown', err);
  }
};

process.on('SIGTERM', handleServerShutdown);
process.on('SIGINT', handleServerShutdown);
