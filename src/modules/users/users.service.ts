import { CreateUserDto } from "./dtos/create-user.dto";
import * as userRepository from "./users.repository";

/**
 * Retrieves all users from the database.
 */
export const getUsers = async () => {
  const users = await userRepository.getUsers();

  return users;
};

/**
 * Retrieves users sorted by mention count.
 * @returns {Array} Sorted list of users by mention count.
 */
export const getUsersByMentionCount = async () => {
  const sortedUsers = userRepository.getUsersByMentionCount();
  return sortedUsers;
};

/**
 * Searches for users based on a given search term.
 *
 * @param searchTerm The term to search for within user records.
 * @returns A list of users matching the search term.
 */
export const searchUsers = async (searchTerm: string) => {
  const users = await userRepository.searchUsers(searchTerm);
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
export const getUserById = async (userId: number) => {
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

// /**
//  * Processes an image file by resizing it to 800x600, converting it to JPEG format with 80% quality,
//  * and saving the processed image to the database.
//  *
//  * @param file - The image file to be processed.
//  * @returns A Promise that resolves with the saved image data.
//  */
// // export const processImage = async (
// //   file: Express.Multer.File,
// //   user_id: number
// // ) => {
// //   const imageBuffer = await sharp(file.buffer)
// //     .resize(800, 600)
// //     .toFormat("jpeg")
// //     .jpeg({ quality: 80 })
// //     .toBuffer();

// //   const savedImage = await userRepository.saveImage(
// //     imageBuffer,
// //     file.originalname,
// //     user_id
// //   );

// //   return savedImage;
// // };

/**
 * Deletes a user from the database by ID.
 * @param {number} userId - The ID of the user to delete.
 */
export const deleteUser = async (userId: number) => {
  const deletedUser = await userRepository.deleteUser(userId);
  return deletedUser;
};

/**
 * Retrieves the recognition number for a specific user.
 * @param userId - The unique identifier of the user.
 * @returns A Promise that resolves with the recognition number associated with the user.
 */
export const getUserRecognitionNumber = async (userId: number) => {
  const recognitionNumber =
    await userRepository.getUserRecognitionNumber(userId);
  return recognitionNumber;
};

/**
 * Retrieves the number of posts for a specific user.
 *
 * @param userId - The unique identifier of the user.
 * @returns A promise that resolves to the number of posts for the user.
 */
export const getNumberOfPostsForUser = async (userId: number) => {
  const numberOfPosts = await userRepository.getNumberOfPostsForUser(userId);
  return numberOfPosts;
};
