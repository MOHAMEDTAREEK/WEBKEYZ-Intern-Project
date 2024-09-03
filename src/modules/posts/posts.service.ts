import * as postRepository from "./posts.repository";

/**
 * Asynchronous function to retrieve all posts.
 *
 * @returns {Promise<Array>} An array of post objects.
 */
export const getPosts = async (): Promise<Array<any>> => {
  const posts = await postRepository.getPosts();
  return posts;
};

/**
 * Asynchronously retrieves a post by its ID.
 *
 * @param {number} id - The ID of the post to retrieve.
 * @returns {Promise<any>} A promise that resolves with the post data.
 */
export const getPostById = async (id: number): Promise<any> => {
  const post = await postRepository.getPostById(id);
  return post;
};

/**
 * Asynchronous function to create a new post.
 *
 * @param postData - Data of the post to be created.
 * @returns The newly created post.
 */

export const createPost = async (postData: any) => {
  const post = await postRepository.createPost(postData);
  return post;
};
/**
 * Updates a post with new data.
 *
 * @param id - The ID of the post to update.
 * @param postData - The new data to update the post with.
 * @returns The updated post.
 */
export const fullyUpdatePost = async (id: number, postData: any) => {
  const post = await postRepository.fullyUpdatePost(id, postData);
  return post;
};
/**
 * Updates a post partially with the provided description and image.
 *
 * @param id - The ID of the post to be updated.
 * @param description - The new description for the post.
 * @param image - The new image URL for the post.
 * @returns The updated post object.
 */
export const partiallyUpdatePost = async (
  id: number,
  description: string,
  image: string
) => {
  const post = await postRepository.partiallyUpdatePost(id, description, image);
  return post;
};

/**
 * Deletes a post by its ID.
 *
 * @param {number} id - The ID of the post to delete.
 * @returns {Promise<any>} A promise that resolves with the deleted post.
 */
export const deletePost = async (id: number): Promise<any> => {
  const post = await postRepository.deletePost(id);
  return post;
};

export const uploadPostPhoto = async (postId: number, imageUrl: string) => {
  const post = await postRepository.uploadPostPhoto(postId, imageUrl);
  return post;
};
