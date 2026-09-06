import { Types } from 'mongoose';

export const generatePairKey = (
  idA: Types.ObjectId | string,
  idB: Types.ObjectId | string,
): string => {
  const [a, b] = [idA.toString(), idB.toString()].sort();
  return `${a}_${b}`;
};
