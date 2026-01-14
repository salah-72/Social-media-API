import { model, Schema, Types } from 'mongoose';

export interface IStory {
  author: Types.ObjectId;
  content?: string;
  img?: {
    url: string;
    publicId: string;
  };
  whoCanSee: 'me' | 'followers' | 'public';
  viewsCount: number;
  likesCount: number;
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

const Story = model<IStory>('Story', storySchema);
export default Story;
