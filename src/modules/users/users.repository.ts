import User from "../../database/models/user.model";
import bcrypt from "bcrypt";
import { BaseError } from "../../shared/exceptions/base.error";
import { CreateUserDto } from "./dtos/create-user.dto";
import { HttpStatusCode } from "axios";
import logger from "../../shared/util/logger";
import { Op } from "sequelize";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";

/**
 * Retrieves all users from the database.
 */
export const getUsers = async () => {
  const users = await User.findAll();

  if (!users) {
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  }
  return users;
};

/**
 * Retrieves a user by ID from the database.
 * @param {number} userId - The ID of the user to retrieve.
 */
export const getUserById = async (userId: number) => {
  const user = await User.findByPk(userId, {
    attributes: {
      exclude: ["password"],
    },
  });

  return user;
};

export const findUserByName = async (firstName: string, lastName: string) => {
  const user = await User.findOne({
    where: { firstName: firstName, lastName: lastName },
  });
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
export const createUser = async (userData: CreateUserDto) => {
  const hashedPassword = await bcrypt.hash(userData.password ?? "", 10);

  const user = await User.create({
    ...userData,
    password: hashedPassword,
  });

  const { password, ...userWithoutPassword } = user.toJSON();
  return userWithoutPassword;
};

/**
 * Updates a user by ID in the database.
 * @param {number} userId - The ID of the user to update.
 * @param {object} updatedData - The updated data for the user.
 */
export const updateUserById = async (userId: number, updatedData: any) => {
  const user = await User.findByPk(userId);
  if (!user)
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  await user.update(updatedData);
  return user;
};

/**
 * Deletes a user by ID from the database.
 * @param {number} email - The ID of the user to delete.
 */
export const validateCredentials = async (email: string, password: string) => {
  const user = await User.findOne({
    where: { email },
  });

  if (!user)
    throw new BaseError(
      ErrorMessage.INVALID_CREDENTIALS,
      HttpStatusCode.Unauthorized
    );

  const isValid = await bcrypt.compare(password, user.password || "");
  if (!isValid)
    throw new BaseError(
      ErrorMessage.INVALID_CREDENTIALS,
      HttpStatusCode.Unauthorized
    );

  user.password = "";

  return user;
};

/**
 * Saves an image to the specified directory after sanitizing the filename.
 *
 * @param imageBuffer The image data to be saved as a Buffer.
 * @param filename The name of the file to be saved.
 * @returns An object containing the sanitized filename and the full path where the image is saved.
 */
// export const saveImage = async (
//   imageBuffer: Buffer,
//   filename: string,
//   user_id: number
// ) => {
//   const sanitizedFilename = filename.replace(/[^\w.-]/g, "_");
//   console.log(user_id);
//   const userExists = await User.findByPk(user_id);
//   if (!userExists) {
//     throw new BaseError("User does not exist", HttpStatus.BAD_REQUEST);
//   }

//   const userImage = await UserImage.create({
//     user_id: user_id,
//     image: imageBuffer,
//     filename: sanitizedFilename,
//   });
//   return { id: userImage.dataValues.id, filename: sanitizedFilename };
// };

/**
 * Deletes a user by their ID.
 *
 * @param {number} userId - The ID of the user to delete.
 * @throws {BaseError} When the user is not found.
 */
export const deleteUser = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user)
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  await user.destroy();
  return user;
};

export const getUserByRefreshToken = async (refreshToken: string) => {
  const user = await User.findOne({
    where: {
      refreshToken,
    },
  });

  return user;
};

export const searchUsers = async (searchTerm: string) => {
  const users = await User.findAll({
    where: {
      [Op.or]: [
        { firstName: { [Op.like]: `%${searchTerm}%` } },
        { lastName: { [Op.like]: `%${searchTerm}%` } },
      ],
    },
  });
  return users;
};
