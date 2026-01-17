import {
  CallbackWithoutResultAndOptionalError,
  model,
  Schema,
  Types,
} from 'mongoose';

export interface ILike {
  user: Types.ObjectId;
  post?: Types.ObjectId;
  comment?: Types.ObjectId;
  story?: Types.ObjectId;
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
    },
    comment: {
      type: Types.ObjectId,
      ref: 'Comment',
    },
    story: {
      type: Types.ObjectId,
      ref: 'Story',
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

likeSchema.pre(
  'validate' as any,
  function (next: CallbackWithoutResultAndOptionalError) {
    const fields = [this.post, this.comment, this.story].filter(Boolean);
    if (fields.length === 0)
      return next(new Error('like must contain post or comment or story'));
    if (fields.length > 0)
      return next(new Error('like must contain only one field'));

    next();
  },
);

const Like = model<ILike>('Like', likeSchema);
export default Like;
