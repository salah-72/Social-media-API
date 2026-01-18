import { model, Schema, Types } from 'mongoose';

export interface IComment {
  user: Types.ObjectId;
  post: Types.ObjectId;
  parentComment: Types.ObjectId | null;
  content: string;
  likesCount: number;
}

const commentSchema = new Schema<IComment>(
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
    parentComment: {
      type: Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    content: {
      type: String,
      required: [true, 'comment content is required'],
      trim: true,
      minlength: [1, 'comment cannot be empty'],
      maxlength: [200, 'comment is too long'],
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

commentSchema.index({ post: 1, parentComment: 1, createdAt: -1 });

const Comment = model<IComment>('Comment', commentSchema);
export default Comment;
