import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { BaseError } from "../exceptions/base.error";

export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (!token) {
    return new BaseError("Token is required", 401);
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET!, (err: any, user: any) => {
    if (err) {
      return new BaseError("Invalid token", 403);
    }

    req.user = user;
    next();
  });
};
