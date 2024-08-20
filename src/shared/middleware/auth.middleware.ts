import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../../config";
import * as usersService from "../../modules/users/users.service";
import { BaseError } from "../exceptions/base.error";

/**
 * Middleware function to authenticate user requests using JWT access tokens.
 * Verifies the access token provided in the request cookies and checks its validity.
 * If the access token is missing, expired, invalid, or the user is not found, appropriate errors are thrown.
 * If the access token is valid, the user information is added to the request object for further processing.
 * @param req - The Express Request object.
 * @param res - The Express Response object.
 * @param next - The Express NextFunction to pass control to the next middleware.
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    throw new BaseError("Access token is required", 403);
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      config.accessToken.secret
    ) as jwt.JwtPayload;

    const userId = decoded.userId;
    if (!userId) {
      throw new BaseError("Invalid access token", 403);
    }

    const user = await usersService.getUserById(userId);
    if (!user) {
      throw new BaseError("User not found", 404);
    }

    req.user = user;

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new BaseError("Access token expired", 401);
    } else if (err instanceof jwt.JsonWebTokenError) {
      throw new BaseError("Invalid access token", 403);
    } else {
      throw new BaseError("Internal server error", 500);
    }
  }
};
