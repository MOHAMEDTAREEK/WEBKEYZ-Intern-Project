import User from "../../database/models/user.model";
import bcrypt from "bcrypt";
import { BaseError } from "../../shared/exceptions/base.error";
import { CreateUserDto } from "./dtos/create-user.dto";
import { HttpStatusCode } from "axios";
import { Op, where } from "sequelize";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";
import Post from "../../database/models/post.model";

/**
 * Retrieves all users from the database.
 */
export const getUsers = async () => {
  const users = await User.findAll({
    attributes: [
      "id",
      "firstName",
      "lastName",
      "profilePicture",
      "email",
      "role",
    ],
  });

  if (!users) {
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  }
  return users;
};

/**
 * Retrieves users from the database based on their mention count in descending order.
 * @returns {Promise<User[]>} A promise that resolves with an array of users sorted by mention count in descending order.
 */
export const getUsersByMentionCount = async (): Promise<User[]> => {
  const users = User.findAll({
    order: [["mentionCount", "DESC"]],
    attributes: [
      "id",
      "firstName",
      "lastName",
      "profilePicture",
      "email",
      "role",
    ],
  });
  return users;
};

/**
 * Asynchronously searches for users based on a given search term.
 * @param searchTerm The term to search for in user's first name or last name.
 * @returns A promise that resolves to an array of users matching the search term.
 */
export const searchUsers = async (searchTerm: string) => {
  const users = await User.findAll({
    where: {
      [Op.or]: [
        { firstName: { [Op.like]: `%${searchTerm}%` } },
        { lastName: { [Op.like]: `%${searchTerm}%` } },
      ],
    },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "profilePicture",
      "email",
      "role",
    ],
  });
  return users;
};

/**
 * Retrieves a user by ID from the database.
 * @param {number} userId - The ID of the user to retrieve.
 */
export const getUserById = async (userId: number) => {
  const user = await User.findByPk(userId, {
    attributes: [
      "id",
      "firstName",
      "lastName",
      "profilePicture",
      "email",
      "role",
    ],
  });

  return user;
};

/**
 * Asynchronously finds a user by their first name and last name.
 *
 * @param {string} firstName - The first name of the user to search for.
 * @param {string} lastName - The last name of the user to search for.
 * @returns {Promise<User | null>} A promise that resolves with the user if found, or null if not found.
 */
export const findUserByName = async (
  firstName: string,
  lastName: string
): Promise<User | null> => {
  const user = await User.findOne({
    where: { firstName: firstName, lastName: lastName },
    attributes: [
      "id",
      "firstName",
      "lastName",
      "profilePicture",
      "email",
      "role",
    ],
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
    attributes: [
      "id",
      "firstName",
      "lastName",
      "profilePicture",
      "email",
      "role",
    ],
  });

  return user;
};

/**
 * Creates a new user in the database.
 * @param {CreateUserDto} userData - The data for the new user.
 */
export const createUser = async (userData: CreateUserDto) => {
  const hashedPassword = await bcrypt.hash(userData.password ?? "", 10);
  const userExists = await getUserByEmail(userData.email);
  if (userExists) {
    throw new BaseError(
      ErrorMessage.USER_ALREADY_EXISTS,
      HttpStatusCode.BadRequest
    );
  }
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

//This is new
/**
 * Retrieves the recognition number of a user based on the provided user ID.
 *
 * @param {number} userId - The ID of the user to retrieve the recognition number for.
 * @throws {BaseError} When the user is not found.
 */

export const getUserRecognitionNumber = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  }
  const mentionCount = await User.findOne({
    where: {
      id: userId,
    },
    attributes: ["mentionCount"],
  });
  return mentionCount;
};

//This is new
/**
 * Asynchronously retrieves the number of posts for a specific user.
 *
 * @param {number} userId - The unique identifier of the user.
 * @throws {BaseError} When the user is not found.
 */
export const getNumberOfPostsForUser = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  }
  const postCount = await Post.count({
    where: {
      userId: userId,
    },
  });

  return postCount;
};

export const updateUser = async (userId: number, userData: any) => {
  const user = await User.findByPk(userId);
  if (!user)
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  await user.update(userData);
  return user;
};
