
/**
 * Represents the attributes of a comment.
 * @property {number} id - The unique identifier of the comment.
 * @property {string} description - The content of the comment.
 * @property {number} userId - The user ID associated with the comment.
 * @property {number} postId - The post ID to which the comment belongs.
 * @property {Date} [createdAt] - The date and time when the comment was created.
 * @property {Date} [updatedAt] - The date and time when the comment was last updated.
 */

interface CommentAttributes {
  id: number;
  description: string;
  userId: number;
  postId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CommentCreationAttributes extends Omit<CommentAttributes, "id"> {}
