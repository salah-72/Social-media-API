import { IUser } from '@/models/userModel';

export const canModerate = (role: IUser['role'] | undefined): boolean =>
  role === 'admin' || role === 'superadmin';
