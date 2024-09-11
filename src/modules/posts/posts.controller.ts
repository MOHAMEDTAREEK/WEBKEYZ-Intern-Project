import { Request, Response } from "express";
import * as postService from "./posts.service";
import { HttpStatusCode } from "axios";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";
import { BaseError } from "../../shared/exceptions/base.error";
import { IResponse } from "../../shared/interfaces/IResponse.interface";
import { createResponse } from "../../shared/util/create-response";
import { SuccessMessage } from "../../shared/enums/constants/info-message.enum";
import { v4 as uuidv4 } from "uuid";
import { bucketName, s3Client } from "../../config/aws-s3.config";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { sequelize } from "../../database/models";
import { QueryInterface } from "sequelize";

/**
 * Retrieves all posts and sends them as a response.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} A promise that resolves when the posts are sent as a response.
 */
export const getPosts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const posts = await postService.getPosts();
  if (!posts) {
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.Post_RETRIEVAL_SUCCESS,
    posts
  );
  return res.send(response);
};
/**
 * Retrieves a post by its ID.
 *
 * @param req - The request object containing the post ID in the parameters.
 * @param res - The response object to send the retrieved post or an error message.
 * @returns A response with the post if found, or a 404 status with "Post not found" message.
 */

export const getPostById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const post = await postService.getPostById(id);
  if (!post) {
    throw new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound);
  }
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.Post_RETRIEVAL_SUCCESS,
    post
  );
  return res.send(response);
};

/**
 * Asynchronous function to create a new post.
 *
 * @param req - The request object containing the post data in the body.
 * @param res - The response object to send back the created post or an error message.
 * @returns A promise that resolves with the created post or an error message.
 */
export const createPost = async (req: Request, res: Response) => {
  const { description, userId } = req.body;
  const files = req.files as Express.Multer.File[];

  const transaction = await sequelize.transaction();

  const imageUrls: string[] = await postService.createPostPhotoUrls(files);

  try {
    const postData = {
      description,
      userId,
      files,
    };
    const { post, mentioned, hashtags } = await postService.createPost(
      postData,
      transaction,
      imageUrls
    );
    if (!post) {
      throw new BaseError(
        ErrorMessage.INTERNAL_SERVER_ERROR,
        HttpStatusCode.InternalServerError
      );
    }
    await transaction.commit();
    const response: IResponse = createResponse(
      HttpStatusCode.Created,
      SuccessMessage.POST_CREATION_SUCCESS,
      { post, mentioned, hashtags }
    );
    return res.send(response);
  } catch (error) {
    await transaction.rollback();
    if (imageUrls.length > 0) {
      await postService.deleteUploadedImages(imageUrls);
    }
    return res.status(HttpStatusCode.InternalServerError).send(error);
  }
};

/**
 * Updates a post with new data.
 *
 * @param {Request} req - The request object containing the post id in params and new post data in body.
 * @param {Response} res - The response object to send back the updated post.
 * @returns {Promise<Response>} A promise that resolves once the post is fully updated.
 */
export const fullyUpdatePost = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = parseInt(req.params.id);
  const postData = req.body;
  if (!postData) {
    throw new BaseError(
      ErrorMessage.FAILED_TO_UPDATE_POST,
      HttpStatusCode.BadRequest
    );
  }
  const post = await postService.fullyUpdatePost(id, postData);
  if (!post) {
    throw new BaseError(
      ErrorMessage.INTERNAL_SERVER_ERROR,
      HttpStatusCode.InternalServerError
    );
  }

  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.POST_FULL_UPDATE_SUCCESS,
    post
  );
  return res.send(response);
};

/**
 * Updates a post partially based on the provided data.
 *
 * @param req - The request object containing the post ID in the parameters and the updated description and image in the body.
 * @param res - The response object to send back the updated post or an error message.
 * @returns A response with the updated post if successful, or an error message if the post was not found.
 */
export const partiallyUpdatePost = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { description, image } = req.body;
  const post = await postService.partiallyUpdatePost(id, description, image);
  if (!post) {
    throw new BaseError(
      ErrorMessage.INTERNAL_SERVER_ERROR,
      HttpStatusCode.InternalServerError
    );
  }
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.POST_Partial_UPDATE_SUCCESS,
    post
  );
  return res.send(response);
};

/**
 * Asynchronous function to delete a post.
 *
 * @param req - The request object containing the post ID in the parameters.
 * @param res - The response object to send the result.
 * @returns A response with the deleted post or an error message if the post was not found.
 */
export const deletePost = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const post = await postService.deletePost(id);
  if (!post) {
    throw new BaseError(
      ErrorMessage.INTERNAL_SERVER_ERROR,
      HttpStatusCode.InternalServerError
    );
  }
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.POST_DELETION_SUCCESS,
    post
  );
  return res.send(response);
};

/**
 * Uploads photo(s) for a post.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @returns A response indicating the success or failure of the photo upload process.
 */
export const uploadPostPhoto = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(HttpStatusCode.BadRequest).send("No photos uploaded");
  }

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

  const id = parseInt(req.params.id);
  const post = await postService.uploadPostPhoto(id, uploadedImageUrls);
  if (!post) {
    throw new BaseError(
      ErrorMessage.INTERNAL_SERVER_ERROR,
      HttpStatusCode.InternalServerError
    );
  }
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.UPLOADING_POST_IMAGE_SUCCESS,
    post
  );
  return res.send(response);
};

/**
 * Asynchronous function to upload images to an AWS S3 bucket and return the URLs of the uploaded images.
 *
 * @param req - The request object containing the image files to be uploaded.
 * @param res - The response object to send back the uploaded image URLs.
 * @returns An array of strings representing the URLs of the uploaded images.
 */
export const getPostImagesUrl = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    return res.status(HttpStatusCode.BadRequest).send("No photos uploaded");
  }

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
