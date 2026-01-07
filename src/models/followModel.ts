import { model, Schema, Types } from 'mongoose';

export interface IFollow {
  follower: Types.ObjectId;
  following: Types.ObjectId;
  status: 'pending' | 'accepted';
}

const followSchema = new Schema<IFollow>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
    },
  },
  { timestamps: true },
);

followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ follower: 1, status: 1 });
followSchema.index({ following: 1, status: 1 });

const Follow = model<IFollow>('Follow', followSchema);
export default Follow;
