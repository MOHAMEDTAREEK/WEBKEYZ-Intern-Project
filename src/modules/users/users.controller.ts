import { NextFunction, Request, Response } from "express";
import * as userServise from "./users.service";
import { BaseError } from "../../shared/exceptions/base.error";
import { HttpStatus } from "../../shared/enums/http-Status.enum";
import { CreateUserDto } from "./dtos/create-user.dto";

/**
 * Retrieves all users and sends them as a response.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export const getUsers = async (req: Request, res: Response) => {
  const users = await userServise.getUsers();
  res.send(users);
};

/**
 * Creates a new user by passing the user data in the request body.
 *
 * @param {Request} req - The request object containing the user data.
 * @param {Response} res - The response object.
 */
export const createUser = async (req: Request, res: Response) => {
  const userData: CreateUserDto = req.body;

  const createdUser = await userServise.createUser(userData);
  res.send(createdUser);
};

/**
 * Retrieves a user by ID from the database.
 *
 * @param {Request} req - The request object containing the user ID.
 * @param {Response} res - The response object.
 */

export const getUserById = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const user = await userServise.getUserById(userId);
  res.send(user);
};

/**
 * Retrieves a user by their email address.
 *
 * @param {Request} req - The request object containing the user's email in the body.
 * @param {Response} res - The response object to send the retrieved user.
 */
export const getUserByEmail = async (req: Request, res: Response) => {
  const email = req.body.email;
  const user = await userServise.getUserByEmail(email);
  res.send(user);
};
