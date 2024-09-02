import Post from "../../database/models/post.model";
import { BaseError } from "../../shared/exceptions/base.error";
import { HttpStatus } from "../../shared/enums/http-Status.enum";
import { PostDto } from "./posts.dto";

/**
 * Asynchronously retrieves all posts from the database.
 *
 * @returns {Promise<Post[]>} A promise that resolves with an array of Post objects representing the retrieved posts.
 * @throws {BaseError} If no posts are found, an error with message "Posts not found" and status HttpStatus.NOT_FOUND is thrown.
 */
export const getPosts = async () => {
  const posts = await Post.findAll();
  if (!posts) {
    throw new BaseError("Posts not found", HttpStatus.NOT_FOUND);
  }
  return posts;
};

/**
 * Retrieves a post by its ID asynchronously.
 *
 * @param id - The ID of the post to retrieve.
 * @returns A promise that resolves with the post if found, otherwise throws a BaseError with status HttpStatus.NOT_FOUND.
 */
export const getPostById = async (id: number) => {
  const post = await Post.findByPk(id);
  if (!post) {
    throw new BaseError("Post not found", HttpStatus.NOT_FOUND);
  }
  return post;
};

/**
 * Creates a new post using the provided post data.
 *
 * @param postData - The data for the new post.
 * @returns The newly created post.
 * @throws BaseError if the post creation fails.
 */
export const createPost = async (postData: any) => {
  const post = await Post.create(postData);
  if (!post) {
    throw new BaseError("Post not created", HttpStatus.INTERNAL_SERVER_ERROR);
  }
  return post;
};

/**
 * Updates a post with the provided data.
 *
 * @param {number} id - The ID of the post to be updated.
 * @param {any} postData - The data to update the post with.
 * @throws {BaseError} When the post is not found.
 */
export const fullyUpdatePost = async (id: number, postData: any) => {
  const post = await Post.findByPk(id);
  if (!post) {
    throw new BaseError("Post not found", HttpStatus.NOT_FOUND);
  }
  await post.update(postData);
  return post;
};

/**
 * Partially updates a post by modifying its description and image.
 *
 * @param id - The ID of the post to be updated.
 * @param description - The new description for the post. If undefined, the description remains unchanged.
 * @param image - The new image for the post. If undefined, the image remains unchanged.
 * @returns The updated post object.
 */
export const partiallyUpdatePost = async (
  id: number,
  description: string,
  image: string
) => {
  const post = (await Post.findByPk(id)) as unknown as PostDto;
  if (!post) {
    throw new BaseError("Post not found", HttpStatus.NOT_FOUND);
  }
  if (description !== undefined) post.description = description;
  if (image !== undefined) post.image = image;
  await post.save();

  return post;
};

/**
 * Deletes a post by its ID.
 *
 * @param {number} id - The ID of the post to delete.
 * @throws {BaseError} When the post is not found.
 */
export const deletePost = async (id: number) => {
  const post = await Post.findByPk(id);
  if (!post) {
    throw new BaseError("Post not found", HttpStatus.NOT_FOUND);
  }
  await post.destroy();
  return post;
};
