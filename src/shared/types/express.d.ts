import { Request } from "express";

/**
 * Extends the Request interface from the 'express' module to include an optional 'user' property of type 'any'.
 */
declare module "express" {
  interface Request {
    user?: any;
    file?: Express.Multer.File;
  }
}
