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
  createdAt: Date;
  updatedAt: Date;
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
likeSchema.index(
  { user: 1, post: 1 },
  { unique: true, partialFilterExpression: { post: { $exists: true } } },
);
likeSchema.index(
  { user: 1, story: 1 },
  { unique: true, partialFilterExpression: { story: { $exists: true } } },
);
likeSchema.index(
  { user: 1, comment: 1 },
  { unique: true, partialFilterExpression: { comment: { $exists: true } } },
);

likeSchema.pre('save', function () {
  if (!this.post && !this.comment && !this.story)
    throw new Error('like must contain post or comment or story');

  if (
    (this.post && (this.comment || this.story)) ||
    (this.comment && (this.post || this.story)) ||
    (this.story && (this.post || this.comment))
  )
    throw new Error('like must contain only one field');
});

const Like = model<ILike>('Like', likeSchema);
export default Like;
