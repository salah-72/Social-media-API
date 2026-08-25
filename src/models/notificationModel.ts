import { model, Schema, Types } from 'mongoose';

export interface INotification {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender: Types.ObjectId;
  type:
    | 'like'
    | 'comment'
    | 'comment_like'
    | 'comment_reply'
    | 'follow'
    | 'follow_request'
    | 'follow_accept'
    | 'post_removed'
    | 'comment_removed'
    | 'account_banned'
    | 'account_unbanned';
  post?: Types.ObjectId;
  comment?: Types.ObjectId;
  story?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'like',
        'comment',
        'comment_like',
        'comment_reply',
        'follow',
        'follow_request',
        'follow_accept',
        'post_removed',
        'comment_removed',
        'account_banned',
        'account_unbanned',
      ],
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
    story: {
      type: Schema.Types.ObjectId,
      ref: 'Story',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = model<INotification>('Notification', notificationSchema);
export default Notification;
