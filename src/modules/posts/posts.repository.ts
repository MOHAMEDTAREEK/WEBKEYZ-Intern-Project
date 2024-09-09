import Post from "../../database/models/post.model";
import { BaseError } from "../../shared/exceptions/base.error";
import * as userRepository from "../users/users.repository";
import Mention from "../../database/models/mention.model";
import { PostDto } from "./dtos/posts.dto";
import { HttpStatusCode } from "axios";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";
import User from "../../database/models/user.model";

/**
 * Asynchronously retrieves all posts from the database.
 *
 * @returns {Promise<Post[]>} A promise that resolves with an array of Post objects representing the retrieved posts.
 * @throws {BaseError} If no posts are found, an error with message "Posts not found" and status HttpStatus.NOT_FOUND is thrown.
 */
export const getPosts = async (): Promise<Post[]> => {
  const posts = await Post.findAll();
  if (!posts) {
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
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
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
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
export const createPost = async (
  userId: number,
  description: string,
  imageUrls: string[]
) => {
  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  }
  const post = await Post.create({
    description: description,
    image: imageUrls,
    userId: userId,
    like: 0,
    mentionedUser: [],
  });
  if (!post) {
    throw new BaseError(
      ErrorMessage.FAILED_TO_CREATE_POST,
      HttpStatusCode.InternalServerError
    );
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
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
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
  const post = await Post.findByPk(id);
  if (!post) {
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }
  if (description !== undefined) post.description = description;
  // if (image !== undefined) post.image = image;
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
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }
  await post.destroy();
  return post;
};

/**
 * Uploads a photo for a post.
 *
 * @param {number} postId - The ID of the post to upload the photo for.
 * @param {string} imageUrl - The URL of the image to be uploaded.
 * @returns {Promise<Post>} The updated post object with the new image.
 */
export const uploadPostPhoto = async (
  postId: number,
  imageUrls: string[]
): Promise<Post> => {
  const post = await Post.findByPk(postId);
  if (!post) {
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }
  if (!imageUrls) {
    throw new BaseError(
      ErrorMessage.IMAGE_URL_NOT_FOUND,
      HttpStatusCode.NotFound
    );
  }
  post.image = imageUrls;
  await post.save();
  return post;
};

/**
 * Creates mentions for a post based on the provided list of user names.
 *
 * @param postId - The ID of the post for which mentions are being created.
 * @param mentions - An array of strings representing the names of users to be mentioned.
 * @returns An array of strings containing the names of users who were successfully mentioned.
 */
export const createMentions = async (
  postId: number,
  mentionedUsers: User[]
) => {
  const post = await Post.findByPk(postId);
  if (!post) {
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }

  for (const mentionedUser of mentionedUsers) {
    const user = await userRepository.getUserById(mentionedUser.id);
    if (user) {
      // Store the mention
      await createMention(postId, user.id);

      // Increment the user's mention count
      user.mentionCount += 1;
      await user.save();
    }
  }

  await post.update({ mentionedUser: mentionedUsers });

  return mentionedUsers;
};
/**
 * Creates a new mention entry in the database.
 *
 * @param {number} postId - The ID of the post being mentioned.
 * @param {number} userId - The ID of the user being mentioned.
 * @returns {Promise<Mention>} The newly created mention object.
 */
export const createMention = async (
  postId: number,
  userId: number
): Promise<Mention> => {
  const post = await Post.findByPk(postId);
  if (!post) {
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }

  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  }
  const mention = await Mention.create({
    postId: postId,
    mentionedUserId: userId,
  });
  return mention;
};
/**
 * Retrieves all mentions associated with a specific post.
 *
 * @param postId - The ID of the post to retrieve mentions for.
 * @returns A Promise that resolves to an array of Mention instances.
 */
export const getMentions = async (postId: number) => {
  const post = await Post.findByPk(postId);
  if (!post) {
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }

  const mentions = await Mention.findAll({
    where: {
      postId: postId,
    },
  });
  return mentions;
};
// /**
//  * Creates a new post with a mention of a specific user.
//  *
//  * @param postData - The data for the new post.
//  * @param userId - The ID of the user being mentioned in the post.
//  * @returns An object containing the created post and the mention.
//  */
// export const createPostWithMention = async (
//   postData: PostDto,
//   userId: number
// ) => {
//   const createdPost = await createPost(postData);
//   const mentions = await createMention(createdPost.id, userId);
//   return {
//     post: createdPost,
//     mentions: mentions,
//   };
// };
