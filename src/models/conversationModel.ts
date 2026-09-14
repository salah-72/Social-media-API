import { model, Schema, Types } from 'mongoose';

export interface IConversation {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  pairKey?: string;
  isGroup?: boolean;
  groupName?: string;
  groupPhoto?: {
    url: string;
    publicId: string;
  };
  groupAdmins?: Types.ObjectId[];
  createdBy?: Types.ObjectId;
  lastMessage?: string;
  lastMessageSender?: Types.ObjectId;
  lastMessageAt?: Date;
  createdAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  participants: {
    type: [
      {
        type: Types.ObjectId,
        ref: 'User',
      },
    ],
    required: true,
    validate: {
      validator: (v: unknown[]) => v.length >= 2,
      message: 'a conversation needs at least 2 participants',
    },
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
  pairKey: {
    type: String,
    unique: true,
    sparse: true,
  },
  groupName: {
    type: String,
    trim: true,
    maxLength: 100,
  },
  groupPhoto: {
    url: String,
    publicId: String,
  },
  groupAdmins: [{ type: Types.ObjectId, ref: 'User' }],
  createdBy: { type: Types.ObjectId, ref: 'User' },
  lastMessage: String,
  lastMessageSender: { type: Types.ObjectId, ref: 'User' },
  lastMessageAt: Date,
  createdAt: { type: Date, default: Date.now },
});

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

const Conversation = model<IConversation>('Conversation', conversationSchema);
export default Conversation;
