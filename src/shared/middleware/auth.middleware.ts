import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../../config";
import * as usersService from "../../modules/users/users.service";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(403).json({ message: "Access token is required" });
  }

  try {
    const decoded = jwt.verify(accessToken, config.accessToken.secret);

    const userId = parseInt(decoded.sub as string, 10);
    if (!userId) {
      return res.status(403).json({ message: "Invalid access token" });
    }

    const user = await usersService.getUserById(userId);
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Access token expired" });
    } else if (err instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ message: "Invalid access token" });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};
