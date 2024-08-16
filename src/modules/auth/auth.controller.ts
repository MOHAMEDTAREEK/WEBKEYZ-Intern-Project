import * as authService from "./auth.service";
import * as userService from "../users/users.service";
import { Request, Response } from "express";
import { BaseError } from "../../shared/exceptions/base.error";

export const signUp = async (req: Request, res: Response) => {
  const userData = req.body;
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

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, tokens } = await authService.logIn(email, password);

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

export const refreshTokens = async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new BaseError("Refresh token is missing", 400);
  }
  const { newRefreshToken, newAccessToken } =
    await authService.refreshTokens(refreshToken);

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  return res.send({ newRefreshToken, newAccessToken });
};
