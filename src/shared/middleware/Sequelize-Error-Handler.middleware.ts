import { NextFunction, Request, Response } from "express";
import { ValidationError, DatabaseError } from "sequelize";
import { HttpStatus } from "../enums/http-Status.enum";
import logger from "../util/logger";

export const sequelizeErrorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ValidationError) {
    // Handle Sequelize validation errors
    logger.error(`Sequelize Validation Error: ${err.message}`);
    return res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: err.message,
      errors: err.errors.map((error) => ({
        path: error.path,
        message: error.message,
      })),
    });
  } else if (err instanceof DatabaseError) {
    // Handle Sequelize database errors
    logger.error(`Sequelize Database Error: ${err.message}`);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Database error occurred",
    });
  } else {
    // Pass the error to the next error handler if it's not a Sequelize error
    return next(err);
  }
};
