import { NextFunction, Request, Response } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;


/**
 * Wraps an asynchronous request handler with error handling.
 * 
 * @param handler - The asynchronous request handler to wrap.
 * @returns A wrapped request handler function that handles errors.
 */
const asyncWrapper = (handler: AsyncHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      next(error);
    }
  };
};

export default asyncWrapper;
