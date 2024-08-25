import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../../shared/middleware/auth.middleware"; 
import * as usersService from "../../modules/users/users.service";
import { BaseError } from "../../shared/exceptions/base.error";

jest.mock("jsonwebtoken");
jest.mock("../../modules/users/users.service");

describe("authMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      cookies: {},
    };
    res = {};
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if accessToken is missing", async () => {
    req.cookies = {}; // No accessToken

    await expect(
      authMiddleware(req as Request, res as Response, next)
    ).rejects.toThrow(new BaseError("Access token is required", 403));
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw an error if accessToken is invalid", async () => {
    req.cookies.accessToken = "invalidToken";

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.JsonWebTokenError("Invalid token");
    });

    await expect(
      authMiddleware(req as Request, res as Response, next)
    ).rejects.toThrow(new BaseError("Invalid access token", 403));
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw an error if accessToken is expired", async () => {
    req.cookies.accessToken = "expiredToken";

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.TokenExpiredError("jwt expired", new Date());
    });

    await expect(
      authMiddleware(req as Request, res as Response, next)
    ).rejects.toThrow(new BaseError("Access token expired", 401));
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw an error if userId is not found in decoded token", async () => {
    req.cookies.accessToken = "validToken";

    (jwt.verify as jest.Mock).mockReturnValue({}); // No userId in the payload

    await expect(
      authMiddleware(req as Request, res as Response, next)
    ).rejects.toThrow(new BaseError("Internal server error", 403));
    expect(next).not.toHaveBeenCalled();
  });

  it("should throw an error if user is not found in the database", async () => {
    req.cookies.accessToken = "validToken";

    (jwt.verify as jest.Mock).mockReturnValue({ userId: "123" });
    (usersService.getUserById as jest.Mock).mockResolvedValue(null); // No user found

    await expect(
      authMiddleware(req as Request, res as Response, next)
    ).rejects.toThrow(new BaseError("Internal server error", 404));
    expect(next).not.toHaveBeenCalled();
  });

  it("should add user to the request object and call next if everything is valid", async () => {
    const mockUser = { id: "123", name: "Test User" };
    req.cookies.accessToken = "validToken";

    (jwt.verify as jest.Mock).mockReturnValue({ userId: "123" });
    (usersService.getUserById as jest.Mock).mockResolvedValue(mockUser);

    await authMiddleware(req as Request, res as Response, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it("should throw an internal server error for any other error", async () => {
    req.cookies.accessToken = "validToken";

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Some unexpected error");
    });

    await expect(
      authMiddleware(req as Request, res as Response, next)
    ).rejects.toThrow(new BaseError("Internal server error", 500));
    expect(next).not.toHaveBeenCalled();
  });
});



