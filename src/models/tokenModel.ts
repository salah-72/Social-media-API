import mongoose, { Types } from 'mongoose';

interface IToken {
  token: string;
  userId: Types.ObjectId;
}
const tokenSchema = new mongoose.Schema<IToken>({
  token: {
    type: String,
    required: [true, 'token is required'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'user of token is required'],
  },
});

const Token = mongoose.model<IToken>('Token', tokenSchema);
export default Token;
