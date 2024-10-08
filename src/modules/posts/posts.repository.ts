import Post from "../../database/models/post.model";
import { BaseError } from "../../shared/exceptions/base.error";
import * as userRepository from "../users/users.repository";
import Mention from "../../database/models/mention.model";
import { HttpStatusCode } from "axios";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";
import User from "../../database/models/user.model";
import { Transaction } from "sequelize";
import * as postService from "./posts.service";
import Comment from "../../database/models/comment.model";
import { sequelize } from "../../database/models";
/**
 * Asynchronously retrieves all posts from the database.
 *
 * @returns {Promise<Post[]>} A promise that resolves with an array of Post objects representing the retrieved posts.
 * @throws {BaseError} If no posts are found, an error with message "Posts not found" and status HttpStatus.NOT_FOUND is thrown.
 */
export const getPosts = async (): Promise<Post[]> => {
  const posts = await Post.findAll({
    attributes: {
      include: [
        [sequelize.fn("COUNT", sequelize.col("comment.id")), "commentCount"],
      ],
    },
    include: [
      {
        model: Comment,
        as: "comment",
        attributes: [],
      },
    ],
    group: ["Post.id"],
    order: [["createdAt", "DESC"]],
  });
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
  imageUrls: string[],
  validHashtags: string[],
  transaction: Transaction
) => {
  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  }

  const post = await Post.create(
    {
      description: description,
      image: imageUrls,
      userId: userId,
      like: 0,
      mentionedUser: [],
      pinnedPost: false,
      hashtag: validHashtags ?? [],
    },
    { transaction }
  );
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
  if (image !== undefined) post.image = [image];
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
  const postPhotos = post.image as string[];
  await postService.deleteUploadedImages(postPhotos);

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
  mentionedUsers: User[],
  transaction: Transaction
) => {
  const post = await Post.findByPk(postId, { transaction });
  if (!post) {
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }

  for (const mentionedUser of mentionedUsers) {
    const user = await userRepository.getUserById(mentionedUser.id);
    if (user) {
      // Store the mention
      await createMention(postId, user.id, transaction);

      // Increment the user's mention count
      user.mentionCount += 1;
      await user.save({ transaction });
    }
  }

  await post.update({ mentionedUser: mentionedUsers }, { transaction });

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
  userId: number,
  transaction: Transaction
): Promise<Mention> => {
  const post = await Post.findByPk(postId, { transaction });
  if (!post) {
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }

  const user = await userRepository.getUserById(userId);
  if (!user) {
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  }
  const mention = await Mention.create(
    {
      postId: postId,
      mentionedUserId: userId,
    },
    { transaction }
  );
  return mention;
};

/**
 * Updates the pinned post by changing the currently pinned post to unpinned and pinning a new post.
 * Throws an error if the post with the given ID is not found.
 *
 * @param id - The ID of the post to be pinned.
 * @returns The updated post that is now pinned.
 */
export const pinPost = async (id: number) => {
  const post = await Post.findByPk(id);
  if (!post) {
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }
  // Unpin the currently pinned post (only one post is pinned)
  await Post.update({ pinnedPost: false }, { where: { pinnedPost: true } });

  //pin the new post.
  await Post.update({ pinnedPost: true }, { where: { id: id } });

  await post.save();
  return await Post.findByPk(id);
};

/**
 * Asynchronously unpins a post by updating its pinned status to false.
 *
 * @param {number} id - The ID of the post to be unpinned.
 * @returns {Promise<Post>} - A promise that resolves to the updated post without pinning.
 * @throws {BaseError} - If the post with the given ID is not found or if the post is not currently pinned.
 */
export const unPinPost = async (id: number) => {
  const post = await Post.findByPk(id);
  if (!post) {
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }
  const isPinned = post.pinnedPost;
  if (!isPinned) {
    throw new BaseError(
      ErrorMessage.POST_NOT_PINNED,
      HttpStatusCode.BadRequest
    );
  }
  await Post.update({ pinnedPost: false }, { where: { id: id } });
  return await Post.findByPk(id);
};
