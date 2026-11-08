import Comment from '@/models/commentModel';
import appError from '@/utils/appError';

export const assertCommentVisible = async (
  commentId: string,
  postId: string,
  blockIds: string[],
) => {
  const comment = await Comment.findById(commentId);

  if (!comment || comment.post.toString() !== postId.toString()) {
    throw new appError('comment not exist', 404);
  }
  if (blockIds.includes(comment.user.toString())) {
    throw new appError('comment not exist', 404);
  }

  return comment;
};
