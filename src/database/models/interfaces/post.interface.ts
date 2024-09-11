import { Json } from "sequelize/types/utils";
import User from "../user.model";

/**
 * Defines the attributes for a post object.
 *
 * @property {number} id - The unique identifier for the post.
 * @property {string} description - The text description of the post.
 * @property {string} [image] - The optional image URL associated with the post.
 * @property {number} userId - The user ID of the post creator.
 * @property {number} like - The number of likes the post has received.
 * @property {Date} [createdAt] - The optional date when the post was created.
 * @property {Date} [updatedAt] - The optional date when the post was last updated.
 */
export interface PostAttributes {
  id: number;
  description: string;
  image?: string[];
  userId: number;
  like: number;
  mentionedUser: Json | Array<User>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PostCreationAttributes extends Omit<PostAttributes, "id"> {}
