import { Request, Response } from "express";
import * as userService from "./users.service";
import { BaseError } from "../../shared/exceptions/base.error";
import { HttpStatus } from "../../shared/enums/http-Status.enum";
import { CreateUserDto } from "./dtos/create-user.dto";
import { sendEmail } from "../../shared/util/send-email";
import fs from "fs";
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

  const createdUser = await userService.createUser(userData);
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
  const user = await userService.getUserById(userId);
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
  const user = await userService.getUserByEmail(email);
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
  const userId = parseInt(req.params.userId);
  console.log(userId);
  const file = req.file;
  const processedImage = await userService.processImage(file, userId);

  return res.send({ processedImage });
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = parseInt(req.params.id);
  const user = await userService.deleteUser(userId);
  return res.send(user);
};
