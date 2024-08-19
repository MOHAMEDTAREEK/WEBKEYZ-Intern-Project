import { Request, Response, NextFunction } from "express";
import { UserRole } from "../enums/user-Role.enum";

export const authorizeRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.roles as UserRole;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden: You do not have access to this resource",
      });
    }
    next();
  };
};
