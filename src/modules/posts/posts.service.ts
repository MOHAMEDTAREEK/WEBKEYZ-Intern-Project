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
import { predefinedHashtags } from "../../shared/enums/hashtag-list.enum";
import { PostDto } from "./dtos/posts.dto";

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
  postData: PostDto,
  transaction: Transaction,
  imageUrls: string[]
) => {
  const mentions = postData.description
    ? extractMentions(postData.description)
    : [];
  const hashtags = postData.description
    ? extractHashtags(postData.description)
    : [];

  const mentionedUsers = await getMentionedUsers(mentions);
  const validHashtags = await getValidHashtags(hashtags);
  const post = await postRepository.createPost(
    postData.userId,
    postData.description,
    imageUrls,
    validHashtags,
    transaction
  );

  const mentioned = await postRepository.createMentions(
    post.id,
    mentionedUsers,
    transaction
  );

  return { post, mentioned };
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

/**
 * Asynchronously uploads files to an S3 bucket and returns the signed URLs of the uploaded images.
 *
 * @param files Array of files to be uploaded
 * @returns Array of signed URLs for the uploaded images
 */
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

/**
 * Retrieves users mentioned in the provided list of mentions.
 *
 * @param {string[]} mentions - List of mentions to search for users.
 * @returns {Promise<User[]>} - A promise that resolves to an array of User objects representing the mentioned users.
 */
export const getMentionedUsers = async (mentions: string[]) => {
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

/**
 * Filters out invalid hashtags from the given array of hashtags.
 *
 * @param hashtags - An array of hashtags to filter.
 * @returns An array of valid hashtags that exist in the predefined list of hashtags.
 */
export const getValidHashtags = async (hashtags: string[]) => {
  return hashtags.filter((hashtag) => predefinedHashtags.includes(hashtag));
};

/**
 * Deletes images uploaded to an S3 bucket.
 *
 * @param {string[]} imageUrls - An array of URLs of the images to be deleted.
 * @returns {Promise<void>} - A Promise that resolves once all images are deleted.
 */

export const deleteUploadedImages = async (
  imageUrls: string[]
): Promise<void> => {
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

/**
 * Asynchronously pins a post identified by the given ID.
 *
 * @param {number} id - The ID of the post to be pinned.
 * @returns {Promise<PostDto>} The pinned post.
 */
export const pinPost = async (id: number) => {
  const post = await postRepository.pinPost(id);
  return post;
};

/**
 * Asynchronously unpins a post by its ID.
 *
 * @param id - The ID of the post to be unpinned.
 * @returns A promise that resolves with the unpinned post.
 */
export const unPinPost = async (id: number) => {
  const post = await postRepository.unPinPost(id);
  return post;
};
