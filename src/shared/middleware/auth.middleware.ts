import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../../config";
import * as usersService from "../../modules/users/users.service";
import { BaseError } from "../exceptions/base.error";
import { ErrorMessage } from "../enums/constants/error-message.enum";

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
    throw new BaseError(ErrorMessage.ACCESS_TOKEN_REQUIRED, 403);
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      config.accessToken.secret || ""
    ) as jwt.JwtPayload;

    const userId = decoded.userId;
    if (!userId) {
      throw new BaseError(ErrorMessage.INVALID_ACCESS_TOKEN, 403);
    }

    const user = await usersService.getUserById(userId);
    if (!user) {
      throw new BaseError(ErrorMessage.USER_NOT_FOUND, 404);
    }

    req.user = user;

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new BaseError(ErrorMessage.ACCESS_TOKEN_EXPIRED, 401);
    } else if (err instanceof jwt.JsonWebTokenError) {
      throw new BaseError(ErrorMessage.INVALID_ACCESS_TOKEN, 403);
    } else {
      throw new BaseError(ErrorMessage.INTERNAL_SERVER_ERROR, 500);
    }
  }
};
