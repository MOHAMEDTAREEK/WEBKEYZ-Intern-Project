import { Request, Response, NextFunction } from "express";
import { errorHandlerMiddleware } from "../../src/shared/middleware/error-Handler.middleware"; // Adjust the path accordingly
import { BaseError } from "../../src/shared/exceptions/base.error";
import { HttpStatus } from "../../src/shared/enums/http-Status.enum";
import logger from "../../src/shared/util/logger";

// Mock the logger to avoid actual logging during tests
jest.mock("../../src/shared/util/logger");

describe("errorHandlerMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      originalUrl: "/test-url",
      method: "GET",
      ip: "127.0.0.1",
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should handle errors that are instances of BaseError", () => {
    const baseError = new BaseError("Test BaseError", HttpStatus.BAD_REQUEST);

    errorHandlerMiddleware(baseError, req as Request, res as Response, next);

    expect(logger.error).toHaveBeenCalledWith(
      `${HttpStatus.BAD_REQUEST} - Test BaseError - /test-url - GET - 127.0.0.1`
    );
    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.send).toHaveBeenCalledWith({
      status: HttpStatus.BAD_REQUEST,
      message: "Test BaseError",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should handle errors that are not instances of BaseError", () => {
    const generalError = new Error("Some other error");

    errorHandlerMiddleware(
      generalError as any,
      req as Request,
      res as Response,
      next
    );

    expect(logger.error).toHaveBeenCalledWith(
      `Unhandled Error : Error: Some other error - /test-url - GET - 127.0.0.1 - ${JSON.stringify(
        generalError
      )}`
    );
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Something went wrong",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should pass the error to next middleware if an exception occurs within the handler", () => {
    const generalError = new Error("Some other error");

    // Simulate an error within the error handler by making the logger throw an error
    (logger.error as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Logging error");
    });

    errorHandlerMiddleware(
      generalError as any,
      req as Request,
      res as Response,
      next
    );

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
  it("should fail if the logger does not log the error for a BaseError", () => {
    const baseError = new BaseError("Test BaseError", HttpStatus.BAD_REQUEST);

    // Override the logger.error mock to do nothing
    (logger.error as jest.Mock).mockImplementationOnce(() => {});

    errorHandlerMiddleware(baseError, req as Request, res as Response, next);

    // Expect the logger to log, but since the implementation is overridden, the test should fail
    expect(logger.error).toHaveBeenCalledWith(
      `${HttpStatus.BAD_REQUEST} - Test BaseError - /test-url - GET - 127.0.0.1`
    );
  });
  it("should fail if the response status is not set correctly for a BaseError", () => {
    const baseError = new BaseError("Test BaseError", HttpStatus.BAD_REQUEST);

    // Override the res.status mock to return an incorrect status
    (res.status as jest.Mock).mockReturnValueOnce({
      ...res,
      status: HttpStatus.INTERNAL_SERVER_ERROR, // Intentional incorrect status
    });

    errorHandlerMiddleware(baseError, req as Request, res as Response, next);

    // Expect the status to be HttpStatus.BAD_REQUEST, but the mock is returning INTERNAL_SERVER_ERROR
    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });
  it("should fail if the response message is not sent correctly for a BaseError", () => {
    const baseError = new BaseError("Test BaseError", HttpStatus.BAD_REQUEST);

    // Override the res.send mock to send an incorrect message
    (res.send as jest.Mock).mockReturnValueOnce({
      status: HttpStatus.BAD_REQUEST,
      message: "Incorrect Message", // Intentional incorrect message
    });

    errorHandlerMiddleware(baseError, req as Request, res as Response, next);

    // Expect the message to be "Test BaseError", but the mock is sending "Incorrect Message"
    expect(res.send).toHaveBeenCalledWith({
      status: HttpStatus.BAD_REQUEST,
      message: "Test BaseError",
    });
  });
  it("should fail if the error handler does not respond with the correct status for non-BaseError errors", () => {
    const generalError = new Error("Some other error");

    // Override the res.status mock to return an incorrect status
    (res.status as jest.Mock).mockReturnValueOnce({
      ...res,
      status: HttpStatus.BAD_REQUEST, // Intentional incorrect status
    });

    errorHandlerMiddleware(
      generalError as any,
      req as Request,
      res as Response,
      next
    );

    // Expect the status to be HttpStatus.INTERNAL_SERVER_ERROR, but the mock is returning BAD_REQUEST
    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
  });
});
