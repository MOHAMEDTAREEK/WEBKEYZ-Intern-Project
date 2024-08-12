import { NextFunction, Request, Response } from "express";
import * as userServise from "./users.service";
import { HttpException } from "../../shared/exceptions/http.exception";
import { HttpStatus } from "../../shared/enums/http-Status.enum";

export const getUsers = async (req: Request, res: Response) => {
  const users = await userServise.getUsers();
  res.send(users);
};

export const createUser = async (req: Request, res: Response) => {
  const userData = req.body;

  const createdUser = await userServise.createUser(userData);
  res.send(createdUser);
};

export const error = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    throw new HttpException("Resource not found", HttpStatus.NOT_FOUND);
  } catch (error) {
    next(error);
  }
};
