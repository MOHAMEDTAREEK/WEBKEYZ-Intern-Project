import * as bcrypt from "bcrypt";
import * as userRepository from "../users/users.repository";
import * as userService from "../users/users.service";
import config from "../../config";
import jwt from "jsonwebtoken";
import { BaseError } from "../../shared/exceptions/base.error";
export const signUp = async (userData: any) => {
  const user = await userRepository.createUser(userData);
  const tokens = await getTokens(user.id, user.email);

  await updateRefreshToken(user.id, tokens.refreshToken);

  return { user, tokens };
};

export const logIn = async (email: string, password: string) => {
  const user = await userService.validateCredentials(email, password);

  const tokens = await getTokens(user.id, user.email);

  await updateRefreshToken(user.id, tokens.refreshToken);
  return { user, tokens };
};

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
  const tokens = await getTokens(user.id, user.email);
  await updateRefreshToken(user.id, tokens.refreshToken);

  return {
    newRefreshToken: tokens.refreshToken,
    newAccessToken: tokens.accessToken,
  };
};

export const updateRefreshToken = async (
  userId: number,
  refreshToken: string
) => {
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  await userRepository.updateUserById(userId, {
    refreshToken: hashedRefreshToken,
  });
};

export const getTokens = async (
  userId: number,
  email: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const payload = { userId, email };

  const accessToken = jwt.sign(payload, config.accessToken.secret, {
    expiresIn: config.accessToken.expiresIn,
  });
  const refreshToken = jwt.sign(payload, config.refreshToken.secret, {
    expiresIn: config.refreshToken.expiresIn,
  });

  return { accessToken, refreshToken };
};
