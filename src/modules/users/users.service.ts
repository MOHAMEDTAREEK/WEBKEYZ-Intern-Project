import { CreateUserDto } from "./dtos/create-user.dto";
import { IUserWithoutPassword } from "./user.interface";
import * as userRepository from "./users.repository";

/**
 * Retrieves all users from the database.
 */
export const getUsers = async () => {
  const users = await userRepository.getUsers();
  return users;
};

/**
 * Retrieves a user by email from the database.
 * @param {string} email - The email of the user to retrieve.
 */
export const getUserByEmail = async (email: string) => {
  const user = await userRepository.getUserByEmail(email);
  return user;
};

/**
 * Retrieves a user by ID from the database.
 * @param {number} userId - The ID of the user to retrieve.
 */
export const getUserById = async (
  userId: number
): Promise<IUserWithoutPassword> => {
  const user = await userRepository.getUserById(userId);
  return user;
};

/**
 * Creates a new user in the database.
 * @param {CreateUserDto} userData - The data for the new user.
 */
export const createUser = async (userData: CreateUserDto) => {
  const createdUser = await userRepository.createUser(userData);
  return createdUser;
};

/**
 * Validates user credentials by checking if the user exists in the database.
 * @param {string} email - The email of the user to validate.
 * @param {string} password - The password of the user to validate.
 */
export const validateCredentials = async (email: string, password: string) => {
  const user = await userRepository.validateCredentials(email, password);

  return user;
};
