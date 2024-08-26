import { Request, Response } from "express";
import { customSignUp } from "../../src/modules/auth/auth.controller"; // Adjust import path
import * as userService from "../../src/modules/users/users.service"; // Adjust import path
import * as authService from "../../src/modules/auth/auth.service"; // Adjust import path

jest.mock("../../src/modules/users/users.service");
jest.mock("../../src/modules/auth/auth.service");

describe("auth Controller", () => {
  const mockRequest = (body: any): Partial<Request> =>
    ({ body }) as Partial<Request>;
  const mockResponse = (): Partial<Response> => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    return res;
  };
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("customSignUp", () => {
    it("should return 400 if user already exists", async () => {
      const req = mockRequest({ email: "test@example.com" });
      const res = mockResponse();

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(true); // Mock user exists
      await customSignUp(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith("User already exists");
    });

    it("should set cookies and return user and tokens if signup is successful", async () => {
      const req = mockRequest({ email: "newuser@example.com" });
      const res = mockResponse();
      const mockUser = { id: 1, email: "newuser@example.com" };
      const mockTokens = {
        refreshToken: "refreshToken",
        accessToken: "accessToken",
      };

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(false);
      (authService.signUp as jest.Mock).mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      });

      await customSignUp(req as Request, res as Response);

      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        mockTokens.refreshToken,
        {
          httpOnly: true,
          secure: true,
        }
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "accessToken",
        mockTokens.accessToken,
        {
          httpOnly: true,
          secure: true,
        }
      );
      expect(res.send).toHaveBeenCalledWith({
        user: mockUser,
        tokens: mockTokens,
      });
    });
  });
});
