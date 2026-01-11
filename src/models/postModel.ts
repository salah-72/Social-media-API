import { model, Schema, Types } from 'mongoose';

export interface IPost {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
  images?: {
    url: string;
    publicId: string;
    _id?: Types.ObjectId;
  }[];
  status: 'draft' | 'published';
  whoCanSee: 'me' | 'followers' | 'public';
  likesCount: number;
  commentsCount: number;
  publishedAt?: Date;
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
      trim: true,
      minlength: [1, 'comment cannot be empty'],
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
    publishedAt: Date,
  },
  {
    timestamps: true,
  },
);

postSchema.pre('save', function () {
  if (this.isNew && this.status === 'published') this.publishedAt = new Date();
});

postSchema.index({ author: 1, status: 1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ author: 1, publishedAt: -1 });
postSchema.index({ whoCanSee: 1 });

const Post = model<IPost>('Post', postSchema);
export default Post;
