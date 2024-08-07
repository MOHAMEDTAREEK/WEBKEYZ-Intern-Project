import { Request, Response } from "express";
import * as userServise from "./users.service";
export const getUsers = async (req: Request, res: Response) => {
  const users = await userServise.getUsers();
  res.send(users);
};

export const createUser = async (req: Request, res: Response) => {
  const userData = req.body;
  const createdUser = await userServise.createUser(userData);
  res.send(createdUser);
};
