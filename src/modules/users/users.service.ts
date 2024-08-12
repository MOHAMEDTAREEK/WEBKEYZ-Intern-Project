import { HttpStatus } from "../../shared/enums/http-Status.enum";
import { BaseError } from "../../shared/exceptions/base.error";
import * as userRepository from "./users.repository";

export const getUsers = async () => {
  throw new BaseError("Resource not found", HttpStatus.NOT_FOUND);
};
export const createUser = async (userData: any) => {
  const createdUser = await userRepository.createUser(userData);
  return createdUser;
};
