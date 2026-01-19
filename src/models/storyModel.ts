import appError from '@/utils/appError';
import {
  CallbackWithoutResultAndOptionalError,
  model,
  Schema,
  Types,
} from 'mongoose';

export interface IStory {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  content?: string;
  img?: {
    url: string;
    publicId: string;
  };
  whoCanSee: 'me' | 'followers' | 'public';
  viewsCount: number;
  likesCount: number;
  createdAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    author: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'story author is required'],
    },
    content: {
      type: String,
      trim: true,
      maxLength: 300,
    },
    img: {
      url: String,
      publicId: String,
    },
    whoCanSee: {
      type: String,
      enum: ['me', 'followers', 'public'],
      default: 'public',
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

storySchema.index({ author: 1, createdAt: -1 });

const Story = model<IStory>('Story', storySchema);
export default Story;
