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
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

messageSchema.pre('validate', function () {
  if (!this.content && !this.image?.url)
    throw new Error('A message needs either content or an image');
});

const Message = model<IMessage>('Message', messageSchema);
export default Message;
