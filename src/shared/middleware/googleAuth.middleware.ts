import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access token is missing or invalid" });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Token is invalid or expired" });
    }
    req.user = user;
    next();
  });
};
