import { IStory } from '@/models/storyModel';
import { IUser } from '@/models/userModel';

declare global {
  namespace Express {
    interface Request {
      currentuser?: IUser;
      targetUser?: IUser;
      story?: IStory;
      blockIds?: Set<string>;
    }
  }
}
