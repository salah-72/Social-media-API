import { model, Schema, Types } from 'mongoose';

export interface IComment {
  user: Types.ObjectId;
  post: Types.ObjectId;
  content: string;
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
    content: {
      type: String,
      required: [true, 'comment content is required'],
      trim: true,
      minlength: [1, 'comment cannot be empty'],
      maxlength: [200, 'comment is too long'],
    },
  },
  { timestamps: true },
);

const Comment = model<IComment>('Comment', commentSchema);
export default Comment;
