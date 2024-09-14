import { NextFunction, Request, Response } from "express";
import { processFile } from "../util/process-file-resizing";

/**
 * Asynchronous function to resize images in the request files.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function in the middleware chain.
 * @returns Promise<void>
 */
export const resizeImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.files) {
    return next();
  }
  const files = req.files as Express.Multer.File[];

  try {
    await Promise.all(files.map(processFile));

    next();
  } catch (err) {
    next(err);
  }
};
