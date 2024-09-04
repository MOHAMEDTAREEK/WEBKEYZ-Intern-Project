import { Request, Response } from "express";
import * as userService from "./users.service";
import { BaseError } from "../../shared/exceptions/base.error";
import { CreateUserDto } from "./dtos/create-user.dto";
import { HttpStatusCode } from "axios";
import { IResponse } from "../../shared/interfaces/IResponse.interface";
import { createResponse } from "../../shared/util/create-response";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";
import { SuccessMessage } from "../../shared/enums/constants/info-message.enum";

/**
 * Retrieves all users and sends them as a response.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} A promise that resolves after sending the users.
 */
export const getUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const users = await userService.getUsers();

  if (!users) {
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  }
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.USER_RETRIEVAL_SUCCESS,
    users
  );
  return res.send(response);
};

/**
 * Creates a new user by passing the user data in the request body.
 *
 * @param {Request} req - The request object containing the user data.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} A promise that resolves after creating the user.
 */
export const createUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userData: CreateUserDto = req.body;

  const createdUser = await userService.createUser(userData);
  if (!createdUser) {
    throw new BaseError(
      ErrorMessage.USER_CREATION_FAILED,
      HttpStatusCode.InternalServerError
    );
  }
  const response: IResponse = createResponse(
    HttpStatusCode.Created,
    SuccessMessage.USER_CREATION_SUCCESS,
    createdUser
  );
  return res.send(response);
};

/**
 * Retrieves a user by ID from the database.
 *
 * @param {Request} req - The request object containing the user ID.
 * @param {Response} res - The response object.
 * @returns {Promise<Response>} A promise that resolves after sending the user.
 */

export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = parseInt(req.params.id);

  const user = await userService.getUserById(userId);
  if (!user) {
    return res
      .status(HttpStatusCode.NotFound)
      .send(ErrorMessage.USER_NOT_FOUND);
  }
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.USER_RETRIEVAL_SUCCESS,
    user
  );
  return res.send(response);
};

/**
 * Retrieves a user by their email address.
 *
 * @param {Request} req - The request object containing the user's email in the body.
 * @param {Response} res - The response object to send the retrieved user.
 * @returns {Promise<Response>} A promise that resolves after sending the user.
 */
export const getUserByEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const email = req.query.email as string;
  if (!email) {
    throw new BaseError(ErrorMessage.EMAIL_REQUIRED, HttpStatusCode.BadRequest);
  }

  const user = await userService.getUserByEmail(email);
  if (!user) {
    return res
      .status(HttpStatusCode.NotFound)
      .send(ErrorMessage.USER_NOT_FOUND);
  }

  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.USER_RETRIEVAL_SUCCESS,
    user
  );
  return res.send(response);
};
// /**
//  * Handles the upload of an image file.
//  *
//  * @param {Request} req - The request object containing the uploaded file.
//  * @param {Response} res - The response object to send the processed image.
//  * @throws {BaseError} Throws an error if no file is uploaded.
//  * @returns {Promise<Response>} A promise that resolves after processing and sending the image.
//  */

// export const uploadImage = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   if (!req.file) {
//     throw new BaseError("No file uploaded", HttpStatus.BAD_REQUEST);
//   }
//   const userId = parseInt(req.params.userId);
//   console.log(userId);
//   const file = req.file;
//   const processedImage = await userService.processImage(file, userId);

//   return res.send({ processedImage });
// };

export const searchUsers = async (req: Request, res: Response) => {
  const searchTerm = (req.query.searchTerm as string) || "";
  if (!searchTerm) {
    throw new BaseError(
      ErrorMessage.INVALID_SEARCH_TERM,
      HttpStatusCode.BadRequest
    );
  }
  const users = await userService.searchUsers(searchTerm);
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.USER_RETRIEVAL_SUCCESS,
    users
  );
  return res.send(response);
};

/**
 * Asynchronous function to delete a user.
 *
 * @param req - The request object containing the user id in the parameters.
 * @param res - The response object to send back the deleted user.
 * @returns A promise that resolves to the response containing the deleted user.
 */
export const deleteUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const user = await userService.deleteUser(userId);
  const response: IResponse = createResponse(
    HttpStatusCode.NoContent,
    SuccessMessage.USER_DELETION_SUCCESS,
    user
  );
  res.send(response);
};
