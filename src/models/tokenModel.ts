import mongoose, { Types } from 'mongoose';
import { string } from 'zod';

interface IToken {
  token: string;
  userId: Types.ObjectId;
  deviceIp?: string;
  revoked: boolean;
  expiresAt: Date;
  revokedAt?: Date;
  userAgent?: string;
}
const tokenSchema = new mongoose.Schema<IToken>({
  token: {
    type: String,
    required: [true, 'token is required'],
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'user of token is required'],
    index: true,
  },
  deviceIp: {
    type: String,
  },
  revoked: {
    type: Boolean,
    default: false,
  },
  revokedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    expires: 0,
  },
  userAgent: {
    type: String,
  },
});

const Token = mongoose.model<IToken>('Token', tokenSchema);
export default Token;
