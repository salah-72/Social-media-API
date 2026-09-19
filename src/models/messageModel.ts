import { Schema, model, Types } from 'mongoose';

export interface IMessage {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content?: string;
  image?: {
    url: string;
    publicId: string;
  };
  video?: {
    url: string;
    publicId: string;
    duration?: number;
  };
  readAt?: Date;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  conversation: {
    type: Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  },
  sender: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    trim: true,
    maxLength: [2000, 'Content cannot exceed 2000 characters'],
  },
  image: {
    url: String,
    publicId: String,
  },
  video: {
    url: String,
    publicId: String,
    duration: Number,
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

messageSchema.pre('validate', function () {
  if (!this.content && !this.image?.url && !this.video?.url)
    throw new Error('a message needs content, an image, or a video');
});

const Message = model<IMessage>('Message', messageSchema);
export default Message;
