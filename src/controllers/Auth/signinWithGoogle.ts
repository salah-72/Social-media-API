import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '../../config/config';
import User from '@/models/userModel';
import { genUsername } from '@/functions/generate_username';
import { genPassport } from '@/functions/generatePassword';
import { logger } from '@/lib/winston';
import { Request, Response, NextFunction } from 'express';
import { generateRefreshToken } from '@/functions/generateTokens';
import Token from '@/models/tokenModel';

passport.use(
  new GoogleStrategy(
    {
      clientID: config.ClientID!,
      clientSecret: config.clientSecret!,
      callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile._json.email });

        if (!user) {
          const username = genUsername(profile._json.given_name!);

          user = await User.create({
            email: profile._json.email,
            username,
            password: genPassport(),
            firstName: profile._json.given_name,
            lastName: profile._json.family_name,
            emailVerified: true,
          });

          logger.info('new user registered with google', {
            email: user.email,
          });
        }

        done(null, user);
      } catch (err) {
        logger.info(err);
        done(err);
      }
    },
  ),
);

export const googleAuthCallback = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err || !user)
      return res.status(401).json({ message: 'Auth failed', err });

    const refreshToken = generateRefreshToken(user._id);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    await Token.deleteOne({ userId: user._id });
    await Token.create({
      token: refreshToken,
      userId: user._id,
    });

    logger.info('Refresh token created for user', {
      userId: user._id,
      token: refreshToken,
    });

    res.redirect('/api/v1/');
  })(req, res, next);
};
