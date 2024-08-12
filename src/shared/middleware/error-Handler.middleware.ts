import { NextFunction, Request, Response } from "express";
import { BaseError } from "../exceptions/base.error";
import { HttpStatus } from "../enums/http-Status.enum";
import logger from "../util/logger";

export const errorHandlerMiddleware = (
  error: BaseError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (error instanceof BaseError) {
      const status = error.status || 500;
      const message = error.response || "Something went wrong";
      logger.error(
        `${status} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
      return res.status(status).send({
        status,
        message,
      });
    } else {
      logger.error(
        `Unhandled Error : ${error} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${JSON.stringify(error)}`
      );

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Something went wrong",
      });
    }
  } catch (err: any) {
    next(err);
  }
};
