import * as bcrypt from "bcrypt";
import * as userRepository from "../users/users.repository";
import * as userService from "../users/users.service";
import config from "../../config";
import jwt from "jsonwebtoken";
import { BaseError } from "../../shared/exceptions/base.error";
import { SignupDto } from "./dtos/signup.dto";
import { LoginDto } from "./dtos/login.dto";

/**
 * Handles user sign up by creating a new user, generating tokens, and updating the refresh token.
 * @param userData - Data for user sign up including name, email, and password.
 * @returns An object containing the newly created user and generated tokens.
 */
export const signUp = async (userData: SignupDto) => {
  const user = await userRepository.createUser(userData);
  const tokens = await getTokens(user.id, user.email);

  await updateRefreshToken(user.id, tokens.refreshToken);

  return { user, tokens };
};

/**
 * Handles user login by validating credentials, generating tokens, and updating the refresh token.
 * @param userData - Data for user login including email and password.
 * @returns An object containing the user details and generated tokens.
 */
export const logIn = async (userData: LoginDto) => {
  const user = await userService.validateCredentials(
    userData.email,
    userData.password
  );

  const tokens = await getTokens(user.id, user.email);

  await updateRefreshToken(user.id, tokens.refreshToken);
  return { user, tokens };
};

/**
 * Refreshes tokens based on the provided refresh token, verifies the user, and updates the refresh token.
 * @param refreshToken - The refresh token used to generate new access and refresh tokens.
 * @returns An object with the new refresh token and access token.
 */
export const refreshTokens = async (refreshToken: string) => {
  const decoded = jwt.verify(
    refreshToken,
    config.refreshToken.secret
  ) as jwt.JwtPayload;

  const user = await userRepository.getUserById(decoded.userId);

  if (!user) {
    throw new BaseError("User not found", 404);
  }

  const isRefreshTokenValid = await bcrypt.compare(
    refreshToken,
    user.refreshToken
  );

  if (!isRefreshTokenValid) {
    throw new BaseError("Invalid refresh token", 401);
  }
  const payload = { userId: user.id, email: user.email };

  const accessToken = jwt.sign(payload, config.accessToken.secret, {
    expiresIn: config.accessToken.expiresIn,
  });

  return {
    newAccessToken: accessToken,
  };
};

/**
 * Updates the refresh token for a specific user by hashing and storing it in the database.
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
 * @param userId - The ID of the user for whom tokens are being generated.
 * @param email - The email of the user for whom tokens are being generated.
 * @returns An object with the newly generated access and refresh tokens.
 */

export const getTokens = async (
  userId: number,
  email: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const payload = { userId, email, role: "admin" };

  const accessToken = jwt.sign(payload, config.accessToken.secret, {
    expiresIn: config.accessToken.expiresIn,
  });
  const refreshToken = jwt.sign(payload, config.refreshToken.secret, {
    expiresIn: config.refreshToken.expiresIn,
  });

  return { accessToken, refreshToken };
};

/**
 * Generates a reset token for a user identified by the provided userId and email.
 * @param userId - The unique identifier of the user.
 * @param email - The email address of the user.
 * @returns The generated reset token.
 */
export const generateResetToken = async (userId: number, email: string) => {
  const payload = { userId, email };
  const resetToken = jwt.sign(payload, config.resetToken.secret, {
    expiresIn: config.resetToken.expiresIn,
  });
  await userRepository.updateUserById(userId, { resetToken: resetToken });

  return resetToken;
};

/**
 * Resets the password for a user.
 *
 * @param {number} userId - The ID of the user whose password is being reset.
 * @param {string} password - The new password to set for the user.
 * @returns {string} A message indicating the success of the password reset.
 */
export const resetPassword = async (userId: number, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  await userRepository.updateUserById(userId, { password: hashedPassword });

  return "Password reset successfully";
};

/**
 * Verifies the reset token by decoding it using the secret from the configuration.
 * Throws a BaseError with status 400 if the reset token is invalid.
 * Throws a BaseError with status 404 if the user associated with the decoded token is not found.
 *
 * @param resetToken The token to be verified.
 * @returns The user associated with the reset token.
 */
export const verifyResetToken = async (resetToken: string) => {
  const decoded = jwt.verify(
    resetToken,
    config.resetToken.secret
  ) as jwt.JwtPayload;

  if (!decoded) {
    throw new BaseError("Invalid reset token", 400);
  }
  const user = await userRepository.getUserById(decoded.userId);

  if (!user) {
    throw new BaseError("User not found", 404);
  }

  return user;
};

/**
 * Creates a new HR user with a random password and saves the user data in the database.
 *
 * @param email - The email address of the HR user.
 * @returns An object containing the newly created HR user and the randomly generated password.
 */

export const inviteHr = async (email: string) => {
  const randomPassword = Math.random().toString(36).slice(-8);

  const userData = {
    email,
    roles: "hr",
    name: "hrUser",
    password: randomPassword,
  };

  const newUser = await userRepository.createUser(userData);

  return { newUser, password: randomPassword };
};
