import { HttpStatusCode } from "axios";
import Comment from "../../database/models/comment.model";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";
import { BaseError } from "../../shared/exceptions/base.error";

export const getComments = async () => {
  const comments = await Comment.findAll();
  return comments;
};

export const createComment = async (commentData: any) => {
  const comment = await Comment.create(commentData);
  return comment;
};

export const fullyUpdateComment = async (
  commentId: number,
  commentData: any
) => {
  const comment = await Comment.findByPk(commentId);
  if (!comment) {
    throw new BaseError(
      ErrorMessage.COMMENT_NOT_FOUND,
      HttpStatusCode.NotFound
    );
  }
  await comment.update(commentData);
  return comment;
};

export const partiallyUpdateComment = async (
  commentId: number,
  description: string
) => {
  const comment = (await Comment.findByPk(commentId)) as any;
  if (!comment) {
    throw new BaseError(
      ErrorMessage.COMMENT_NOT_FOUND,
      HttpStatusCode.NotFound
    );
  }
  if (description !== undefined) comment.description = description;
  await comment.save();

  return comment;
};

export const deleteComment = async (commentId: string) => {
  const comment = await Comment.findByPk(commentId);
  await comment?.destroy();
  return comment;
};
