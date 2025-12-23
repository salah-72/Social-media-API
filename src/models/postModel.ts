import { model, Schema, Types } from 'mongoose';

export interface IPost {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  images?: {
    url: string;
    publicId: string;
  }[];
  status: 'draft' | 'published';
  whoCanSee: 'me' | 'followers' | 'public';
  likesCount: number;
  commentsCount: number;
}

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'post must have author'],
    },
    content: {
      type: String,
      required: [true, 'post must have content'],
      maxLength: [800, 'post content must be less than 800 char'],
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    whoCanSee: {
      type: String,
      enum: ['me', 'followers', 'public'],
      default: 'public',
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'publishedAt',
    },
  },
);

const Post = model('Post', postSchema);
export default Post;
