import { model, Schema, Types } from 'mongoose';

export interface IConversation {
  _id: Types.ObjectId;
  participants: [Types.ObjectId, Types.ObjectId];
  pairKey: string;
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
      validator: (v: unknown[]) => v.length === 2,
      message: 'A conversation must have exactly 2 participants',
    },
  },
  pairKey: {
    type: String,
    required: true,
    unique: true,
  },
  lastMessage: String,
  lastMessageSender: { type: Types.ObjectId, ref: 'User' },
  lastMessageAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const Conversation = model<IConversation>('Conversation', conversationSchema);
export default Conversation;
