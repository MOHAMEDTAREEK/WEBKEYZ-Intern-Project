import User from "../../database/models/user.model";
import { IUser, IUserWithoutPassword } from "./user.interface";
import bcrypt from "bcrypt";
import { BaseError } from "../../shared/exceptions/base.error";
import { CreateUserDto } from "./dtos/create-user.dto";

/**
 * Retrieves all users from the database.
 */
export const getUsers = async () => {
  return await User.findAll();
};

/**
 * Retrieves a user by ID from the database.
 * @param {number} userId - The ID of the user to retrieve.
 */
export const getUserById = async (
  userId: number
): Promise<IUserWithoutPassword> => {
  const user: IUserWithoutPassword = (await User.findByPk(userId, {
    attributes: {
      exclude: ["password"],
    },
  })) as unknown as IUserWithoutPassword;
  return user;
};

/**
 * Retrieves a user by email from the database.
 * @param {string} email - The email of the user to retrieve.
 */
export const getUserByEmail = async (email: string) => {
  const user = await User.findOne({
    where: { email },
  });
  return user;
};

/**
 * Creates a new user in the database.
 * @param {CreateUserDto} userData - The data for the new user.
 */
export const createUser = async (
  userData: CreateUserDto
): Promise<IUserWithoutPassword> => {
  const hasedPassword = await bcrypt.hash(userData.password, 10);
  const user: IUserWithoutPassword = (await User.create({
    ...userData,
    password: hasedPassword,
  })) as unknown as IUserWithoutPassword;
  return user;
};

/**
 * Updates a user by ID in the database.
 * @param {number} userId - The ID of the user to update.
 * @param {object} updatedData - The updated data for the user.
 */
export const updateUserById = async (userId: number, updatedData: any) => {
  const user = await User.findByPk(userId);
  if (!user) throw new BaseError("User not found", 404);
  await user.update(updatedData);
  return user;
};

/**
 * Deletes a user by ID from the database.
 * @param {number} email - The ID of the user to delete.
 */
export const validateCredentials = async (email: string, password: string) => {
  const user: IUser = (await User.findOne({
    where: { email },
  })) as unknown as IUser;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new BaseError("Invalid credentials", 401);

  user.password = undefined;

  return user;
};
