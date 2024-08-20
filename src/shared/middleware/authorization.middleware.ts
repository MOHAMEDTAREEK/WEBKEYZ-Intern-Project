import { Request, Response, NextFunction } from "express";
import { UserRole } from "../enums/user-Role.enum";

/**
 * Middleware function to authorize user roles for accessing a resource.
 * @param roles - An array of user roles allowed to access the resource.
 * @returns A middleware function that checks if the user's role is authorized to access the resource.
 */
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
