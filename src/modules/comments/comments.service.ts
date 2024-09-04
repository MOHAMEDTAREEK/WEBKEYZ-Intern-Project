import * as commentRepository from "./comments.repository";

/**
 * Asynchronous function to retrieve comments using the commentRepository module.
 *
 * @returns {Promise<Array>} An array of comments retrieved from the database.
 */
export const getComments = async (): Promise<Array<any>> => {
  const comments = await commentRepository.getComments();
  return comments;
};
/**
 * Asynchronous function to create a new comment.
 *
 * @param {any} commentData - Data for the new comment.
 * @returns {Promise<any>} The newly created comment.
 */
export const createComment = async (commentData: any): Promise<any> => {
  const comment = await commentRepository.createComment(commentData);
  return comment;
};

/**
 * Updates a comment with the given commentId using the provided commentData.
 *
 * @param commentId The unique identifier of the comment to be updated.
 * @param commentData The new data to update the comment with.
 * @returns The updated comment object.
 */
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
/**
 * Updates a comment partially with the given description.
 *
 * @param {number} commentId - The ID of the comment to be updated.
 * @param {string} description - The new description to partially update the comment.
 * @returns {Promise<object>} The updated comment object.
 */
export const partiallyUpdateComment = async (
  commentId: number,
  description: string
): Promise<object> => {
  const comment = await commentRepository.partiallyUpdateComment(
    commentId,
    description
  );
  return comment;
};

/**
 * Deletes a comment by its ID.
 *
 * @param commentId - The ID of the comment to be deleted.
 * @returns The deleted comment.
 */
export const deleteComment = async (commentId: string) => {
  const comment = await commentRepository.deleteComment(commentId);
  return comment;
};
