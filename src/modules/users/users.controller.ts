import { Request, Response } from "express";
import * as userServise from "./users.service";
import { BaseError } from "../../shared/exceptions/base.error";
import { HttpStatus } from "../../shared/enums/http-Status.enum";
import { CreateUserDto } from "./dtos/create-user.dto";
import { sendEmail } from "../../shared/util/send-email";

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
  const users = await userServise.getUsers();

  return res.send(users);
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

  const createdUser = await userServise.createUser(userData);
  return res.send(createdUser);
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
  const user = await userServise.getUserById(userId);
  return res.send(user);
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
  const email = req.body.email;
  const user = await userServise.getUserByEmail(email);
  return res.send(user);
};
/**
 * Handles the upload of an image file.
 *
 * @param {Request} req - The request object containing the uploaded file.
 * @param {Response} res - The response object to send the processed image.
 * @throws {BaseError} Throws an error if no file is uploaded.
 * @returns {Promise<Response>} A promise that resolves after processing and sending the image.
 */

export const uploadImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (!req.file) {
    throw new BaseError("No file uploaded", HttpStatus.BAD_REQUEST);
  }

  const file = req.file;
  const processedImage = await userServise.processImage(file);

  return res.send({ processedImage });
};
