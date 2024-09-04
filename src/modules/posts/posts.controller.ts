import { Request, Response } from "express";
import * as postService from "./posts.service";
import * as postRepository from "./posts.repository";
import { HttpStatusCode } from "axios";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";
import { BaseError } from "../../shared/exceptions/base.error";
import { IResponse } from "../../shared/interfaces/IResponse.interface";
import { createResponse } from "../../shared/util/create-response";
import { SuccessMessage } from "../../shared/enums/constants/info-message.enum";

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
  const postData = req.body;
  const { post, mentionedUserNames } = await postService.createPost(postData);
  if (!post) {
    throw new BaseError(
      ErrorMessage.INTERNAL_SERVER_ERROR,
      HttpStatusCode.InternalServerError
    );
  }
  const response: IResponse = createResponse(
    HttpStatusCode.Created,
    SuccessMessage.POST_CREATION_SUCCESS,
    { post, mentionedUserNames }
  );
  return res.send(response);
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

export const uploadPostPhoto = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(HttpStatusCode.BadRequest).send("No file uploaded");
  }

  const file = req.file as Express.MulterS3.File;
  const imageUrl = file.location;

  const postId = parseInt(req.body.postId);
  const post = await postService.uploadPostPhoto(postId, imageUrl);
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

export const getMentions = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const mentions = await postRepository.getMentions(id);
  if (!mentions) {
    throw new BaseError(
      ErrorMessage.FAILED_TO_GET_MENTIONS,
      HttpStatusCode.NotFound
    );
  }
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.MENTIONS_RETRIEVAL_SUCCESS,
    mentions
  );
  return res.send(response);
};

export const createPostWithMention = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const postData = req.body;
  const { post, mentionedUser } = await postService.createPostWithMention(
    postData,
    userId
  );
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.MENTIONS_CREATION_SUCCESS,
    {
      post: post,
      mentionedUser: mentionedUser,
    }
  );
  return res.send(response);
};
