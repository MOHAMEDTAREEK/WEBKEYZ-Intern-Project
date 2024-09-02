import * as commentRepository from "./comments.repository";
export const getComments = async () => {
  const comments = await commentRepository.getComments();
  return comments;
};

export const createComment = async (commentData: any) => {
  const comment = await commentRepository.createComment(commentData);
  return comment;
};

export const fullyUpdateComment = async (
  commentId: number,
  commentData: any
) => {
  const comment = await commentRepository.fullyUpdateComment(
    commentId,
    commentData
  );
  return comment;
};
export const partiallyUpdateComment = async (
  commentId: number,
  description: string
) => {
  const comment = await commentRepository.partiallyUpdateComment(
    commentId,
    description
  );
  return comment;
};

export const deleteComment = async (commentId: string) => {
  const comment = await commentRepository.deleteComment(commentId);
  return comment;
};
