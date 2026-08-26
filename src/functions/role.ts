import { IUser } from '@/models/userModel';

export const canModerate = (role: IUser['role'] | undefined): boolean =>
  role === 'admin' || role === 'superadmin';

export const canModerateUser = (
  moderatorRole: IUser['role'] | undefined,
  targetRole: IUser['role'],
): boolean => {
  if (moderatorRole === 'superadmin' && targetRole !== 'superadmin')
    return true;
  if (moderatorRole === 'admin') return targetRole === 'user';

  return false;
};
