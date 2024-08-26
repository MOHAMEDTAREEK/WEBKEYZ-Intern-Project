import { Request, Response, NextFunction } from "express";
import { ValidationError, DatabaseError, ValidationErrorItem } from "sequelize";
import { sequelizeErrorHandlerMiddleware } from "../../src/shared/middleware/Sequelize-Error-Handler.middleware"; // Adjust the path accordingly
import { HttpStatus } from "../../src/shared/enums/http-Status.enum";
import logger from "../../src/shared/util/logger";
import { DatabaseErrorParent } from "sequelize/types/errors/database-error";

// Mock the logger to avoid actual logging during tests
jest.mock("../../src/shared/util/logger");

describe("sequelizeErrorHandlerMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should handle Sequelize DatabaseError", () => {
    const databaseError = new DatabaseError(
      new Error("DB connection failed") as DatabaseErrorParent
    );

    sequelizeErrorHandlerMiddleware(
      databaseError,
      req as Request,
      res as Response,
      next
    );

    expect(logger.error).toHaveBeenCalledWith(
      `Sequelize Database Error: DB connection failed`
    );
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Database error occurred",
    });
    expect(next).not.toHaveBeenCalled();
  });
  it("should pass non-Sequelize errors to the next error handler", () => {
    const otherError = new Error("Some other error");

    sequelizeErrorHandlerMiddleware(
      otherError,
      req as Request,
      res as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(otherError);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
