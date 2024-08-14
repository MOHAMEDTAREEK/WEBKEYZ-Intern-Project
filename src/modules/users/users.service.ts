import { IUserWithoutPassword } from "./user.interface";
import * as userRepository from "./users.repository";
export const getUsers = async () => {
  const users = await userRepository.getUsers();
  return users;
};

export const createUser = async (userData: any) => {
  const createdUser = await userRepository.createUser(userData);
  return createdUser;
};

export const validateCredentials = async (email: string, password: string) => {
  const user = await userRepository.validateCredentials(email, password);

  return user;
};

export const getUserById = async (
  userId: number
): Promise<IUserWithoutPassword> => {
  const user = await userRepository.getUserById(userId);
  return user;
};

export const getUserByEmail = async (email: string) => {
  const user = await userRepository.getUserByEmail(email);
  return user;
};
