import { HttpStatusCode } from "axios";
import Comment from "../../database/models/comment.model";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";
import { BaseError } from "../../shared/exceptions/base.error";

/**
 * Retrieves all comments from the database.
 * @returns {Promise<Comment[]>} An array of all comments.
 */

export const getComments = async (): Promise<Comment[]> => {
  const comments = await Comment.findAll();
  return comments;
};
/**
 * Creates a new comment in the database.
 * @param {any} commentData - The data for the new comment.
 * @returns {Promise<Comment>} The created comment.
 */

export const createComment = async (commentData: any): Promise<Comment> => {
  const comment = await Comment.create(commentData);
  return comment;
};
/**
 * Fully updates an existing comment in the database.
 * @param {number} commentId - The ID of the comment to update.
 * @param {any} commentData - The new data for the comment.
 * @returns {Promise<Comment>} The updated comment.
 * @throws {BaseError} If the comment is not found.
 */

export const fullyUpdateComment = async (
  commentId: number,
  commentData: any
): Promise<Comment> => {
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
/**
 * Partially updates an existing comment in the database.
 * @param {number} commentId - The ID of the comment to update.
 * @param {string} description - The new description for the comment.
 * @returns {Promise<Comment>} The updated comment.
 * @throws {BaseError} If the comment is not found.
 */

export const partiallyUpdateComment = async (
  commentId: number,
  description: string
): Promise<Comment> => {
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
/**
 * Deletes an existing comment from the database.
 * @param {string} commentId - The ID of the comment to delete.
 * @returns {Promise<Comment>} The deleted comment.
 */

export const deleteComment = async (commentId: string): Promise<Comment | null> => {
  const comment = await Comment.findByPk(commentId);
  await comment?.destroy();
  return comment;
};
