import * as postRepository from "./posts.repository";
import { extractMentions } from "../../shared/util/extract-mention";
import { PostDto } from "./dtos/posts.dto";
import * as userService from "../users/users.service";
import { extractHashtags } from "../../shared/util/extract-hashtag";
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

export const createPost = async (postData: PostDto) => {
  const post = await postRepository.createPost(postData);
  const mentions = postData.description
    ? extractMentions(postData.description)
    : [];
  const hashtags = postData.description
    ? extractHashtags(postData.description)
    : [];
  const mentionedUsers = await postRepository.createMentions(post.id, mentions);

  return { post, mentionedUsers, hashtags };
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
/**
 * Uploads a photo for a post.
 *
 * @param postId - The ID of the post to upload the photo for.
 * @param imageUrl - The URL of the image to be uploaded.
 * @returns The updated post after uploading the photo.
 */
export const uploadPostPhoto = async (postId: number, imageUrl: string) => {
  const post = await postRepository.uploadPostPhoto(postId, imageUrl);
  return post;
};
/**
 * Creates a new post with mentions and retrieves the mentioned user.
 *
 * @param postData - The data for the new post.
 * @param userId - The ID of the user creating the post.
 * @returns An object containing the created post and the mentioned user.
 */
export const createPostWithMention = async (
  postData: PostDto,
  userId: number
) => {
  const { post, mentions } = await postRepository.createPostWithMention(
    postData,
    userId
  );
  const mentionedUser = await userService.getUserById(userId);
  return {
    post: post,
    mentionedUser: mentionedUser,
  };
};
