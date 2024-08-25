import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { BaseError } from "../exceptions/base.error";
import config from "../../config";

/**
 * Middleware function for Google authentication.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function to call in the middleware chain.
 */
export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (!token) {
    return new BaseError("Token is required", 401);
  }

  jwt.verify(token, config.accessToken.secret, (err: any, user: any) => {
    if (err) {
      return new BaseError("Invalid token", 403);
    }

    req.user = user;
    next();
  });
};
