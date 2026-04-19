import { Schema, model } from 'mongoose';

const blckListTokenSchema = new Schema({
  token: {
    type: String,
    required: [true, 'token is required'],
    unique: true,
    index: true,
  },
  expiredAt: {
    type: Date,
    required: [true, 'expiration date is required'],
    index: true,
    expires: 0,
  },
});

const BlackList = model('BlackListToken', blckListTokenSchema);
export default BlackList;
