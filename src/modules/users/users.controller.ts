import { NextFunction, Request, Response } from "express";
import * as userServise from "./users.service";
import { BaseError } from "../../shared/exceptions/base.error";
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
  throw new BaseError("Resource not found", HttpStatus.NOT_FOUND);
};
