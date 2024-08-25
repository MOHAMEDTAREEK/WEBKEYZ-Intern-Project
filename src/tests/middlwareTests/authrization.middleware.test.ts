import { Request, Response, NextFunction } from "express";
import { authorizeRole } from "../../shared/middleware/authorization.middleware";
import { UserRole } from "../../shared/enums/user-Role.enum";

describe("authorizeRole Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should allow access if the user has the required role", () => {
    mockRequest.user = { role: UserRole.Admin };

    const middleware = authorizeRole([UserRole.Admin, UserRole.User]);
    middleware(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction as NextFunction
    );

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it("should deny access if the user does not have the required role", () => {
    mockRequest.user = { role: UserRole.User };

    const middleware = authorizeRole([UserRole.Admin]);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Forbidden: You do not have access to this resource",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should deny access if the user role is not defined", () => {
    mockRequest.user = { role: undefined };

    const middleware = authorizeRole([UserRole.Admin, UserRole.User]);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Forbidden: You do not have access to this resource",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should deny access if the user object is missing", () => {
    mockRequest.user = undefined;

    const middleware = authorizeRole([UserRole.Admin]);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Forbidden: You do not have access to this resource",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should allow access if multiple roles are allowed and user has one of them", () => {
    mockRequest.user = { role: UserRole.User };

    const middleware = authorizeRole([UserRole.Admin, UserRole.User]);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it("should handle case where roles array is empty", () => {
    mockRequest.user = { role: UserRole.User };

    const middleware = authorizeRole([]);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Forbidden: You do not have access to this resource",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
