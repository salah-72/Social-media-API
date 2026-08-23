import User from '../models/userModel';

export const isFirstUser = async (): Promise<boolean> => {
  const existingUsersCount = await User.countDocuments();
  return existingUsersCount === 0;
};
