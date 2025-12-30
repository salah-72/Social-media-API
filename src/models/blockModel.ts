import { model, Schema, Types } from 'mongoose';

export interface IBlock {
  blocker: Types.ObjectId;
  blocked: Types.ObjectId;
}

const blockSchema = new Schema<IBlock>({
  blocker: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
  blocked: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

const Block = model('Block', blockSchema);
export default Block;
