import { IPost } from '@/models/postModel';
import { IStory } from '@/models/storyModel';
import { IUser } from '@/models/userModel';
import { AuthUser } from '@/utils/getUsersFromCache';

declare global {
  namespace Express {
    interface Request {
      currentuser?: AuthUser;
      targetUser?: IUser;
      story?: IStory;
      post?: IPost;
      blockIds?: Set<string>;
    }
  }
}
