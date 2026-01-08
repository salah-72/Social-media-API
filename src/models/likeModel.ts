import { model, Schema, Types } from 'mongoose';

export interface ILike {
  user: Types.ObjectId;
  post: Types.ObjectId;
  type: 'like' | 'love' | 'care' | 'sad' | 'angry' | 'haha' | 'wow';
}

const likeSchema = new Schema<ILike>(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'user is required'],
    },
    post: {
      type: Types.ObjectId,
      ref: 'Post',
      required: [true, 'post is required'],
    },
    type: {
      type: String,
      enum: ['like', 'love', 'care', 'sad', 'angry', 'haha', 'wow'],
      default: 'like',
    },
  },
  { timestamps: true },
);

likeSchema.index({ user: 1, createdAt: -1 });

const Like = model<ILike>('Like', likeSchema);
export default Like;
