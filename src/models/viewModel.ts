import { model, Schema, Types } from 'mongoose';

export interface IView {
  story: Types.ObjectId;
  user: Types.ObjectId;
  at: Date;
}

const viewSchema = new Schema<IView>({
  story: {
    type: Types.ObjectId,
    ref: 'Story',
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  at: {
    type: Date,
    default: Date.now,
  },
});

viewSchema.index({ story: 1, user: 1 }, { unique: true });

const View = model<IView>('View', viewSchema);
export default View;
