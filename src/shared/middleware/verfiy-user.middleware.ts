import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { BaseError } from "../exceptions/base.error";

const verifyUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;

  if (!token) {
    throw new BaseError("No token provided.", 400);
  }

  try {
    const secretKey = process.env.JWT_ACCESS_SECRET;
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    throw new BaseError("Invalid token.", 401);
  }
};

export default verifyUser;
