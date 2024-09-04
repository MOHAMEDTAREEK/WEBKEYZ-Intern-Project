import Post from "../../database/models/post.model";
import { BaseError } from "../../shared/exceptions/base.error";
import * as userRepository from "../users/users.repository";
import Mention from "../../database/models/mention.model";
import { PostDto } from "./posts.dto";
import { HttpStatusCode } from "axios";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";
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
export const createPost = async (postData: any) => {
  const post = await Post.create(postData);
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
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }
  await post.destroy();
  return post;
};

export const uploadPostPhoto = async (postId: number, imageUrl: string) => {
  const post = await Post.findByPk(postId);
  if (!post) {
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }
  post.image = imageUrl;
  await post.save();
  return post;
};
export const createMentions = async (postId: number, mentions: string[]) => {
  const post = await Post.findByPk(postId);
  if (!post) {
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }
  const mentionedUserNames: string[] = []; // Array to store names of mentioned users

  for (const name of mentions) {
    const [firstName, lastName] = name.split(" ");
    console.log(firstName, lastName);
    const user = await userRepository.findUserByName(firstName, lastName);
    console.log(user);
    if (user) {
      // Store the mention
      await createMention(postId, user.id);

      // Increment the user's mention count
      user.mentionCount += 1;
      await user.save();
      mentionedUserNames.push(`${firstName} ${lastName}`);
    }
  }

  const mentionsList = await getMentions(postId);
  const mentionedUserIds = mentionsList.map(
    (mention) => mention.mentionedUserId
  );

  return mentionedUserNames;
};

export const createMention = async (postId: number, userId: number) => {
  const mention = await Mention.create({
    postId: postId,
    mentionedUserId: userId,
  });
  return mention;
};

export const getMentions = async (postId: number) => {
  const mentions = await Mention.findAll({
    where: {
      postId: postId,
    },
  });
  return mentions;
};

export const createPostWithMention = async (
  postData: PostDto,
  userId: number
) => {
  const createdPost = await createPost(postData);
  const mentions = await createMention(createdPost.id, userId);
  return {
    post: createdPost,
    mentions: mentions,
  };
};
