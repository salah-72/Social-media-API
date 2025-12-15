import config from '@/config/config';
import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.GOOGLE_USER,
    pass: config.GOOGLE_PASSWORD,
  },
});
