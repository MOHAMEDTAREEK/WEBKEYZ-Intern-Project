import { Request, Response, NextFunction } from "express";
import { UserRole } from "../enums/user-Role.enum";
import { ErrorMessage } from "../enums/constants/error-message.enum";

/**
 * Middleware function to authorize user role for accessing a resource.
 * @param role - An array of user role allowed to access the resource.
 * @returns A middleware function that checks if the user's role is authorized to access the resource.
 */
export const authorizeRole = (role: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as UserRole;

    if (!userRole || !role.includes(userRole)) {
      return res.status(403).json({
        message: ErrorMessage.FORBIDDEN_ACTION,
      });
    }
    next();
  };
};
