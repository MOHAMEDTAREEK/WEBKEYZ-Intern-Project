/**
 * Authentication Service
 *
 * This module provides various authentication-related functionalities including user sign-up, login,
 * token generation, token verification, and more. The service interacts with user repositories and
 * handles user authentication and authorization processes.
 */

import * as bcrypt from "bcrypt";
import * as userRepository from "../users/users.repository";
import * as userService from "../users/users.service";
import config from "../../config";
import jwt from "jsonwebtoken";
import { HttpStatusCode } from "axios";
import { BaseError } from "../../shared/exceptions/base.error";
import { SignupDto } from "./dtos/signup.dto";
import { LoginDto } from "./dtos/login.dto";
import { UserRole } from "../../shared/enums/user-Role.enum";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";
import { profile } from "console";

/**
 * Handles user sign-up by creating a new user, generating tokens, and updating the refresh token.
 *
 * @param userData - Data for user sign-up including name, email, and password.
 * @returns An object containing the newly created user and generated tokens.
 * @throws {BaseError} Throws an error if user creation or token generation fails.
 */
export const signUp = async (userData: SignupDto) => {
  const user = await userRepository.createUser(userData);
  if (!user) {
    throw new BaseError(
      ErrorMessage.USER_CREATION_FAILED,
      HttpStatusCode.InternalServerError
    );
  }
  const tokens = await getTokens(user.id, user.email);
  if (!tokens) {
    throw new BaseError(
      ErrorMessage.FAILED_TO_GENERATE_TOKENS,
      HttpStatusCode.InternalServerError
    );
  }

  await updateRefreshToken(user.id, tokens.refreshToken);

  return { user, tokens };
};

/**
 * Handles user login by validating credentials, generating tokens, and updating the refresh token.
 *
 * @param userData - Data for user login including email and password.
 * @returns An object containing the user details and generated tokens.
 * @throws {BaseError} Throws an error if credentials are invalid or token generation fails.
 */
export const logIn = async (userData: LoginDto) => {
  const user = await userService.validateCredentials(
    userData.email,
    userData.password
  );

  if (!user) {
    throw new BaseError(
      ErrorMessage.INVALID_CREDENTIALS,
      HttpStatusCode.Unauthorized
    );
  }

  const tokens = await getTokens(user.id, user.email);
  if (!tokens) {
    throw new BaseError(
      ErrorMessage.FAILED_TO_GENERATE_TOKENS,
      HttpStatusCode.InternalServerError
    );
  }

  await updateRefreshToken(user.id, tokens.refreshToken);

  return { user, tokens };
};

/**
 * Refreshes tokens based on the provided refresh token, verifies the user, and updates the refresh token.
 *
 * @param refreshToken - The refresh token used to generate new access and refresh tokens.
 * @returns An object with the new refresh token and access token.
 * @throws {BaseError} Throws an error if the refresh token is invalid or token generation fails.
 */
export const refreshTokens = async (refreshToken: string) => {
  const decoded = jwt.verify(
    refreshToken,
    config.refreshToken.secret || ""
  ) as jwt.JwtPayload;

  const user = await userRepository.getUserById(decoded.userId);

  if (!user) {
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  }

  const isRefreshTokenValid = await bcrypt.compare(
    refreshToken,
    user.refreshToken || ""
  );

  if (!isRefreshTokenValid) {
    throw new BaseError(
      ErrorMessage.INVALID_REFRESH_TOKEN,
      HttpStatusCode.Unauthorized
    );
  }
  const payload = { userId: user.id, email: user.email };

  const accessToken = jwt.sign(payload, config.accessToken.secret || "", {
    expiresIn: config.accessToken.expiresIn,
  });
  if (!accessToken) {
    throw new BaseError(
      ErrorMessage.FAILED_TO_GENERATE_TOKENS,
      HttpStatusCode.InternalServerError
    );
  }

  return {
    newAccessToken: accessToken,
  };
};

/**
 * Updates the refresh token for a specific user by hashing and storing it in the database.
 *
 * @param userId - The ID of the user for whom the refresh token is being updated.
 * @param refreshToken - The new refresh token to be stored.
 * @returns A promise that resolves when the refresh token is updated.
 */

export const updateRefreshToken = async (
  userId: number,
  refreshToken: string
) => {
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  await userRepository.updateUserById(userId, {
    refreshToken: hashedRefreshToken,
  });
};

/**
 * Generates new access and refresh tokens for a user based on user ID and email.
 *
 * @param userId - The ID of the user for whom tokens are being generated.
 * @param email - The email of the user for whom tokens are being generated.
 * @returns An object with the newly generated access and refresh tokens.
 */

export const getTokens = async (
  userId: number,
  email: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const payload = { userId, email, role: "user" };

  const accessToken = jwt.sign(payload, config.accessToken.secret || "", {
    expiresIn: config.accessToken.expiresIn,
  });
  const refreshToken = jwt.sign(payload, config.refreshToken.secret || "", {
    expiresIn: config.refreshToken.expiresIn,
  });

  return { accessToken, refreshToken };
};

/**
/**
 * Generates a reset token for a user identified by the provided userId and email.
 * 
 * @param userId - The unique identifier of the user.
 * @param email - The email address of the user.
 * @returns The generated reset token.
 */
export const generateResetToken = async (userId: number, email: string) => {
  const payload = { userId, email };
  const resetToken = jwt.sign(payload, config.resetToken.secret || "", {
    expiresIn: config.resetToken.expiresIn,
  });
  await userRepository.updateUserById(userId, { resetToken: resetToken });

  return resetToken;
};

/**
 * Resets the password for a user.
 *
 * @param userId - The ID of the user whose password is being reset.
 * @param newPassword - The new password to set for the user.
 * @returns A message indicating the success of the password reset.
 */
export const resetPassword = async (
  userId: number,
  newPassword: string
): Promise<string> => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userRepository.updateUserById(userId, { password: hashedPassword });

  return "Password reset successfully";
};

/**
 * Verifies the reset token by decoding it using the secret from the configuration.
 *
 * @param resetToken - The token to be verified.
 * @returns The user associated with the reset token.
 * @throws {BaseError} Throws an error if the reset token is invalid or the user is not found.
 */
export const verifyResetToken = async (resetToken: string) => {
  const decoded = jwt.verify(
    resetToken,
    config.resetToken.secret || ""
  ) as jwt.JwtPayload;

  if (!decoded) {
    throw new BaseError(
      ErrorMessage.INVALID_RESET_TOKEN,
      HttpStatusCode.Unauthorized
    );
  }
  const user = await userRepository.getUserById(decoded.userId);

  if (!user) {
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  }

  return user;
};

/**
 * Creates a new HR user with a random password and saves the user data in the database.
 *
 * @param email - The email address of the HR user.
 * @returns An object containing the newly created HR user and the randomly generated password.
 * @throws {BaseError} Throws an error if the HR user already exists.
 */

export const inviteHr = async (email: string) => {
  const randomPassword = Math.random().toString(36).slice(-8);

  const userData = {
    email,
    role: UserRole.HR,
    firstName: "hr",
    lastName: "User",
    password: randomPassword,
    profilePicture: "example.com/image.jpg",
  };
  const userExists = await userRepository.getUserByEmail(email);
  if (userExists) {
    throw new BaseError(
      ErrorMessage.USER_ALREADY_EXISTS,
      HttpStatusCode.BadRequest
    );
  }
  const newUser = await userRepository.createUser(userData);

  return { newUser, password: randomPassword };
};

/**
 * Generates a Google token for the specified user.
 *
 * @param user - The user object containing id and email properties.
 * @returns A JWT token with the user's id and email, valid for 1 hour.
 */
export const getGoogleToken = async (user: any) => {
  const payload = {
    id: user.id,
    email: user.email,
  };
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "365d",
  });
};

/**
 * Retrieves user data from a Google token.
 *
 * @param token - The Google token to decode and extract user data from.
 * @returns A promise that resolves to the user data decoded from the token.
 * @throws {BaseError} Throws an error if the token is invalid.
 */
export const getUserDataFromToken = async (token: string): Promise<any> => {
  const decodedUserData = await verifyGoogleToken(token);
  if (!decodedUserData) {
    return new BaseError(
      ErrorMessage.INVALID_TOKEN,
      HttpStatusCode.Unauthorized
    );
  }

  const userData = {
    email: decodedUserData.email,
    firstName: decodedUserData.given_name,
    lastName: decodedUserData.family_name,
    profilePicture: decodedUserData.picture,
    role: UserRole.User,
  };

  return userData;
};

/**
 * Logs in a user using Google authentication.
 * Validates user credentials based on the provided email, and if valid,
 * generates a Google access token for the user.
 *
 * @param {string} email - The email address of the user attempting to log in.
 * @throws {BaseError} If the user credentials are invalid or the user is not found.
 */

export const loginGoogleUser = async (email: string) => {
  const credentialsMatch = await userRepository.validateCredentials(email, "");
  if (!credentialsMatch) {
    return new BaseError(
      ErrorMessage.INVALID_CREDENTIALS,
      HttpStatusCode.Unauthorized
    );
  }
  const user = await userRepository.getUserByEmail(email);
  if (!user) {
    throw new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound);
  }
  const accessToken = await getGoogleToken(user);

  return accessToken;
};

/**
 * Verifies a Google token by fetching user information from the Google API.
 *
 * @param {string} token - The Google token to be verified.
 * @returns {Promise<any>} A promise that resolves to the user information obtained from the Google API.
 * @throws {BaseError} If the request to fetch user info from Google fails.
 */

export const verifyGoogleToken = async (token: string): Promise<any> => {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new BaseError(
      `Failed to fetch user info from Google: ${response.statusText}`,
      400
    );
  }

  const userInfo = await response.json();
  return userInfo;
};
