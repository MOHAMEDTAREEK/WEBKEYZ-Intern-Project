import * as postRepository from "./posts.repository";
import { extractMentions } from "../../shared/util/extract-mention";
import * as userRepository from "../users/users.repository";
import { extractHashtags } from "../../shared/util/extract-hashtag";
import { bucketName, s3Client } from "../../config/aws-s3.config";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import User from "../../database/models/user.model";
import { Transaction } from "sequelize";
import { extractKeyFromUrl } from "../../shared/util/extract-key-from-url";

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

export const createPost = async (
  postData: any,
  transaction: Transaction,
  imageUrls: string[]
) => {
  const post = await postRepository.createPost(
    postData.userId,
    postData.description,
    imageUrls,
    transaction
  );

  const mentions = postData.description
    ? extractMentions(postData.description)
    : [];
  const hashtags = postData.description
    ? extractHashtags(postData.description)
    : [];

  const mentionedUsers = await getMentionedUsers(mentions, post.id);
  const mentioned = await postRepository.createMentions(
    post.id,
    mentionedUsers,
    transaction
  );

  return { post, mentioned, hashtags };
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
export const uploadPostPhoto = async (postId: number, imageUrl: string[]) => {
  const post = await postRepository.uploadPostPhoto(postId, imageUrl);
  return post;
};
export const createPostPhotoUrls = async (files: any) => {
  const uploadedImageUrls: string[] = [];

  for (const file of files) {
    const fileKey = `${uuidv4()}-${file.originalname}`;

    const params = {
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));

    const imageUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: bucketName, Key: fileKey }),
      { expiresIn: 3600 }
    );

    uploadedImageUrls.push(imageUrl);
  }

  return uploadedImageUrls;
};

export const getMentionedUsers = async (mentions: string[], postId: number) => {
  const mentionedUsers: User[] = [];

  for (const name of mentions) {
    const [firstName, lastName] = name.split(" ");
    const user = await userRepository.findUserByName(firstName, lastName);
    if (user) {
      mentionedUsers.push(user);
    }
  }
  return mentionedUsers;
};

export const deleteUploadedImages = async (imageUrls: string[]) => {
  const deletePromises = imageUrls.map(async (url) => {
    const key = extractKeyFromUrl(url);

    const params = {
      Bucket: bucketName,
      Key: key,
    };

    await s3Client.send(new DeleteObjectCommand(params));
  });

  await Promise.all(deletePromises);
};

