import * as authService from "./auth.service";
import * as userService from "../users/users.service";
import { Request, Response } from "express";
import { BaseError } from "../../shared/exceptions/base.error";
import { SignupDto } from "./dtos/signup.dto";
import { LoginDto } from "./dtos/login.dto";

/**
 * Handles user sign up by checking if the user already exists, signing up the user, setting cookies for tokens,
 * and returning the user and tokens in the response.
 *
 * @param {Request} req - The request object containing user data in the body.
 * @param {Response} res - The response object to send back the user and tokens.
 * @returns {Promise<Response>} A promise that resolves when the user sign up process is completed.
 */
export const signUp = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userData: SignupDto = req.body;
  const userExists = await userService.getUserByEmail(userData.email);
  if (userExists) {
    return res.status(400).send("User already exists");
  }
  const { user, tokens } = await authService.signUp(userData);

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: true,
  });
  res.cookie("accessToken", tokens.accessToken, {
    httpOnly: true,
    secure: true,
  });

  return res.send({ user, tokens });
};

/**
 * Handles user login by logging in the user, setting cookies for tokens, and returning the user and tokens in the response.
 *
 * @param {Request} req - The request object containing user data in the body.
 * @param {Response} res - The response object to send back the user and tokens.
 * @returns {Promise<Response>} A promise that resolves when the user login process is completed.
 */

export const login = async (req: Request, res: Response): Promise<Response> => {
  const userData: LoginDto = req.body;
  const { user, tokens } = await authService.logIn(userData);

  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: true,
  });
  res.cookie("accessToken", tokens.accessToken, {
    httpOnly: true,
    secure: true,
  });
  return res.send({ user, tokens });
};

/**
 * Handles refreshing user tokens by validating the refresh token, generating new tokens, setting new cookies,
 * and returning the new tokens in the response.
 *
 * @param {Request} req - The request object containing the refresh token in cookies.
 * @param {Response} res - The response object to send back the new tokens.
 * @returns {Promise<Response>} A promise that resolves when the token refresh process is completed.
 */
export const refreshTokens = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new BaseError("Refresh token is missing", 400);
  }
  const { newAccessToken } = await authService.refreshTokens(refreshToken);

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  return res.send({ newAccessToken });
};
