import { NextFunction, Request, Response } from "express";
import { BaseError } from "../exceptions/base.error";
import { HttpStatus } from "../enums/http-Status.enum";
import logger from "../util/logger";

/**
 * Middleware function to handle errors in the application.
 * Logs the error details and sends an appropriate response back to the client.
 * If the error is an instance of BaseError, it logs the status, message, URL, method, and IP.
 * If the error is not an instance of BaseError, it logs the error details, URL, method, IP, and the error object.
 * If an error occurs during the process, it passes the error to the next middleware.
 */
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
