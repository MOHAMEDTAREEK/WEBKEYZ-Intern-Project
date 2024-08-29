import { Request, Response } from "express";
import {
  customForgotPassword,
  customInviteHr,
  customIogout,
  customLogin,
  customRefreshTokens,
  customResetPassword,
  customResetPasswordWithoutToken,
  customSignUp,
  getGoogleAccessToken,
  getGoogleRefreshToken,
} from "../../src/modules/auth/auth.controller";
import * as userService from "../../src/modules/users/users.service";
import * as authService from "../../src/modules/auth/auth.service";
import * as userRepository from "../../src/modules/users/users.repository";
import { LoginDto } from "../../src/modules/auth/dtos/login.dto";
import { BaseError } from "../../src/shared/exceptions/base.error";
import { sendEmail } from "../../src/shared/util/send-email";
import { googleAuthCallback } from "../../src/modules/auth/auth.controller";

jest.mock("../../src/modules/users/users.service");
jest.mock("../../src/modules/auth/auth.service");
jest.mock("../../src/modules/users/users.repository");
jest.mock("../../src/shared/util/send-email", () => ({
  sendEmail: jest.fn(),
}));

describe("auth Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let status: jest.Mock;
  let send: jest.Mock;
  let cookie: jest.Mock;
  let clearCookie: jest.Mock;
  let mockRedirect: jest.Mock;

  beforeEach(() => {
    status = jest.fn().mockReturnThis();
    send = jest.fn().mockReturnThis();
    cookie = jest.fn().mockReturnThis();
    clearCookie = jest.fn().mockReturnThis();
    mockRedirect = jest.fn();
    res = {
      status,
      send,
      cookie,
      clearCookie,
      redirect: mockRedirect,
      json: jest.fn().mockReturnThis(),
    };
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("signUp", () => {
    it("should return 400 if user already exists", async () => {
      req = { body: { email: "existinguser@example.com" } };
      (userService.getUserByEmail as jest.Mock).mockResolvedValue({ id: 1 });

      await customSignUp(req as Request, res as Response);

      expect(status).toHaveBeenCalledWith(400);
      expect(send).toHaveBeenCalledWith("User already exists");
    });

    it("should create a new user, set cookies, and return user and tokens", async () => {
      req = { body: { email: "newuser@example.com" } };
      const mockUser = { id: 1, email: "newuser@example.com" };
      const mockTokens = {
        refreshToken: "mockRefreshToken",
        accessToken: "mockAccessToken",
      };

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (authService.signUp as jest.Mock).mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      });

      await customSignUp(req as Request, res as Response);

      expect(cookie).toHaveBeenCalledWith("refreshToken", "mockRefreshToken", {
        httpOnly: true,
        secure: true,
      });
      expect(cookie).toHaveBeenCalledWith("accessToken", "mockAccessToken", {
        httpOnly: true,
        secure: true,
      });
      expect(send).toHaveBeenCalledWith({ user: mockUser, tokens: mockTokens });
    });
  });
  describe("customLogin Controller", () => {
    let mockUser: any;
    let mockTokens: any;

    beforeEach(() => {
      req = {
        body: {
          email: "test@example.com",
          password: "password123",
        } as LoginDto,
      };
      mockUser = { id: 1, email: "test@example.com" };
      mockTokens = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should successfully log in the user and set cookies", async () => {
      (authService.logIn as jest.Mock).mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      });

      await customLogin(req as Request, res as Response);

      expect(authService.logIn).toHaveBeenCalledWith(req.body);
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

    it("should return 401 if credentials are invalid", async () => {
      (authService.logIn as jest.Mock).mockRejectedValue(
        new Error("Invalid credentials")
      );

      await customLogin(req as Request, res as Response);

      expect(authService.logIn).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith("Invalid credentials");
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it("should handle errors from the service", async () => {
      const error = new Error("Something went wrong");
      (authService.logIn as jest.Mock).mockRejectedValue(error);

      await customLogin(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith("Something went wrong");
    });

    it("should not set cookies if an error occurs during login", async () => {
      (authService.logIn as jest.Mock).mockRejectedValue(
        new Error("Login failed")
      );

      await customLogin(req as Request, res as Response);

      expect(res.cookie).not.toHaveBeenCalled();
    });

    it("should call the login service with correct parameters", async () => {
      (authService.logIn as jest.Mock).mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      });

      await customLogin(req as Request, res as Response);

      expect(authService.logIn).toHaveBeenCalledWith(req.body);
    });
  });
  describe("refreshAccessToken Controller", () => {
    it("should throw an error if refreshToken is missing", async () => {
      await expect(
        customRefreshTokens(req as Request, res as Response)
      ).rejects.toThrow(
        new BaseError(
          "Cannot destructure property 'refreshToken' of 'req.cookies' as it is undefined.",
          400
        )
      );
    });

    it("should return new access token and set cookie if refreshToken is valid", async () => {
      const mockNewAccessToken = "newAccessToken";
      (authService.refreshTokens as jest.Mock).mockResolvedValue({
        newAccessToken: mockNewAccessToken,
      });

      req.cookies = { refreshToken: "validRefreshToken" };

      await customRefreshTokens(req as Request, res as Response);

      expect(authService.refreshTokens).toHaveBeenCalledWith(
        "validRefreshToken"
      );
      expect(cookie).toHaveBeenCalledWith("accessToken", mockNewAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      expect(send).toHaveBeenCalledWith({
        newAccessToken: mockNewAccessToken,
      });
    });

    it("should handle errors from authService", async () => {
      const error = new Error("Token refresh failed");
      (authService.refreshTokens as jest.Mock).mockRejectedValue(error);

      req.cookies = { refreshToken: "validRefreshToken" };

      await expect(
        customRefreshTokens(req as Request, res as Response)
      ).rejects.toThrow(error);

      expect(cookie).not.toHaveBeenCalled();
    });
  });
  describe("forgotPassword Controller", () => {
    beforeEach(() => {
      req = {
        body: { newPassword: "" },
        params: { token: "" },
      };
    });

    it("should throw an error if user is not found", async () => {
      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);

      req.body.email = "nonexistent@example.com";

      await expect(
        customForgotPassword(req as Request, res as Response)
      ).rejects.toThrow(new BaseError("User not found", 404));
    });

    test("should generate reset token and send email if user exists", async () => {
      const mockUser = { dataValues: { id: 1, email: "test@example.com" } };
      const mockResetToken = "mockResetToken";

      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (authService.generateResetToken as jest.Mock).mockResolvedValue(
        mockResetToken
      );
      (sendEmail as jest.Mock).mockResolvedValue(undefined);

      req.body.email = "test@example.com";

      await customForgotPassword(req as Request, res as Response);

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(authService.generateResetToken).toHaveBeenCalledWith(
        1,
        "test@example.com"
      );
      expect(sendEmail).toHaveBeenCalledWith(
        "test@example.com",
        `Click the following link to reset your password: http://localhost:3000/reset-password/:${mockResetToken}`
      );
      expect(send).toHaveBeenCalledWith({ resetToken: mockResetToken });
    });

    it("should handle errors from authService.generateResetToken", async () => {
      const mockUser = { dataValues: { id: 1, email: "test@example.com" } };
      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (authService.generateResetToken as jest.Mock).mockRejectedValue(
        new Error("Token generation failed")
      );

      req.body.email = "test@example.com";

      await expect(
        customForgotPassword(req as Request, res as Response)
      ).rejects.toThrow(new Error("Token generation failed"));
      expect(sendEmail).not.toHaveBeenCalled();
    });

    it("should handle errors from sendEmail", async () => {
      const mockUser = { dataValues: { id: 1, email: "test@example.com" } };
      const mockResetToken = "mockResetToken";

      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (authService.generateResetToken as jest.Mock).mockResolvedValue(
        mockResetToken
      );
      (sendEmail as jest.Mock).mockRejectedValue(
        new Error("Email sending failed")
      );

      req.body.email = "test@example.com";

      await expect(
        customForgotPassword(req as Request, res as Response)
      ).rejects.toThrow(new Error("Email sending failed"));
    });
  });

  describe("resetPassword Controller", () => {
    it("should reset password successfully", async () => {
      const mockUser = { id: 1 };
      (authService.verifyResetToken as jest.Mock).mockResolvedValue(mockUser);
      (authService.resetPassword as jest.Mock).mockResolvedValue(undefined);

      req.body.password = "newPassword";
      (req.params as { token: string }).token = "validToken";

      await customResetPassword(req as Request, res as Response);

      expect(authService.verifyResetToken).toHaveBeenCalledWith("validToken");
      expect(authService.resetPassword).toHaveBeenCalledWith(1, "newPassword");
      expect(send).toHaveBeenCalledWith("Password reset successfully");
    });

    it("should throw error if token is missing", async () => {
      (req.params as { token?: string }).token = "";

      await expect(
        customResetPassword(req as Request, res as Response)
      ).rejects.toThrow(new BaseError("Token is required", 400));
    });

    it("should throw error if token is invalid or expired", async () => {
      (authService.verifyResetToken as jest.Mock).mockResolvedValue(null);

      req.body.newPassword = "newPassword";
      (req.params as { token: string }).token = "InvalidToken";

      await expect(
        customResetPassword(req as Request, res as Response)
      ).rejects.toThrow(new BaseError("Invalid or expired token", 400));
    });

    it("should handle errors from verifyResetToken", async () => {
      const error = new Error("Token verification failed");
      (authService.verifyResetToken as jest.Mock).mockRejectedValue(error);

      req.body.newPassword = "newPassword";
      (req.params as { token?: string }).token = "validToken";

      await expect(
        customResetPassword(req as Request, res as Response)
      ).rejects.toThrow(error);
      expect(send).not.toHaveBeenCalled();
    });

    it("should handle errors from resetPassword", async () => {
      const mockUser = { id: 1 };
      (authService.verifyResetToken as jest.Mock).mockResolvedValue(mockUser);
      const error = new Error("Password reset failed");
      (authService.resetPassword as jest.Mock).mockRejectedValue(error);

      req.body.newPassword = "newPassword";
      (req.params as { token?: string }).token = "validToken";

      await expect(
        customResetPassword(req as Request, res as Response)
      ).rejects.toThrow(error);
      expect(send).not.toHaveBeenCalled();
    });
  });

  describe("customResetPasswordWithoutToken", () => {
    it("should reset password successfully", async () => {
      const mockUser = { dataValues: { id: 1 } };
      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (authService.resetPassword as jest.Mock).mockResolvedValue(
        "Password reset successfully"
      );

      req.body.email = "user@example.com";
      req.body.newPassword = "newPassword";

      await customResetPasswordWithoutToken(req as Request, res as Response);

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        "user@example.com"
      );
      expect(authService.resetPassword).toHaveBeenCalledWith(1, "newPassword");
      expect(send).toHaveBeenCalledWith("Password reset successfully");
    });

    it("should throw error if user is not found", async () => {
      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);

      req.body.email = "user@example.com";
      req.body.newPassword = "newPassword";

      await expect(
        customResetPasswordWithoutToken(req as Request, res as Response)
      ).rejects.toThrow(new BaseError("User not found", 404));
    });

    it("should handle errors from resetPassword service", async () => {
      const mockUser = { dataValues: { id: 1 } };
      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      const error = new Error("Password reset failed");
      (authService.resetPassword as jest.Mock).mockRejectedValue(error);

      req.body.email = "user@example.com";
      req.body.newPassword = "newPassword";

      await expect(
        customResetPasswordWithoutToken(req as Request, res as Response)
      ).rejects.toThrow(error);
      expect(send).not.toHaveBeenCalled();
    });

    it("should handle missing email in request body", async () => {
      req.body.newPassword = "newPassword";

      await expect(
        customResetPasswordWithoutToken(req as Request, res as Response)
      ).rejects.toThrow(
        new BaseError("Password reset failed", 404) // Customize this if your code has different error handling
      );
    });
  });
  describe("logout Controller", () => {
    it("should clear cookies and send success message", async () => {
      await customIogout(req as Request, res as Response);

      expect(clearCookie).toHaveBeenCalledWith("accessToken");
      expect(clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(send).toHaveBeenCalledWith("Logged out successfully");
    });
    it("should handle errors when sending response", async () => {
      send.mockImplementationOnce(() => {
        throw new Error("Failed to send response");
      });

      await expect(
        customIogout(req as Request, res as Response)
      ).rejects.toThrow("Failed to send response");
      expect(clearCookie).toHaveBeenCalledWith("accessToken");
      expect(clearCookie).toHaveBeenCalledWith("refreshToken");
      expect(send).toHaveBeenCalledWith("Logged out successfully");
    });
  });
  describe("inviteHr Controller", () => {
    beforeEach(() => {
      req = {
        body: { email: "test@example.com" },
      };
      jest.clearAllMocks();
    });
    it("should throw an error if the user already exists", async () => {
      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(true);

      await expect(
        customInviteHr(req as Request, res as Response)
      ).rejects.toThrow(new BaseError("User already exists", 400));
    });

    it("should invite a new HR user and send an email", async () => {
      const newUser = { email: "test@example.com", password: "tempPassword" };

      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (authService.inviteHr as jest.Mock).mockResolvedValue(newUser);
      (sendEmail as jest.Mock).mockResolvedValue(undefined);

      await customInviteHr(req as Request, res as Response);

      expect(authService.inviteHr).toHaveBeenCalledWith("test@example.com");
      expect(sendEmail).toHaveBeenCalledWith(
        "test@example.com",
        `Hi Hr this is your new temp password please login with it ${newUser.password}`
      );
      expect(send).toHaveBeenCalledWith("Invitation sent successfully");
    });
    it("should handle error when sendEmail fails", async () => {
      const newUser = { email: "test@example.com", password: "tempPassword" };

      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (authService.inviteHr as jest.Mock).mockResolvedValue(newUser);
      (sendEmail as jest.Mock).mockRejectedValue(
        new Error("Failed to send email")
      );

      await expect(
        customInviteHr(req as Request, res as Response)
      ).rejects.toThrow("Failed to send email");
    });

    it("should return 200 status and success message when HR is invited successfully", async () => {
      const newUser = { email: "test@example.com", password: "tempPassword" };

      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (authService.inviteHr as jest.Mock).mockResolvedValue(newUser);
      (sendEmail as jest.Mock).mockResolvedValue(undefined);

      await customInviteHr(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(send).toHaveBeenCalledWith("Invitation sent successfully");
    });
  });
  describe("getGoogleAccessToken", () => {
    it("should return 400 if idToken is not provided", async () => {
      await getGoogleAccessToken(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Access token is required",
      });
    });
    it("should return user data when idToken is provided", async () => {
      const mockUser = { id: "123", email: "test@example.com" };
      req.body.idToken = "valid-token";

      (authService.getUserDataFromToken as jest.Mock).mockResolvedValue(
        mockUser
      );

      await getGoogleAccessToken(req as Request, res as Response);

      expect(authService.getUserDataFromToken).toHaveBeenCalledWith(
        "valid-token"
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(mockUser);
    });

    it("should handle errors thrown by getUserDataFromToken", async () => {
      req.body.idToken = "invalid-token";

      (authService.getUserDataFromToken as jest.Mock).mockRejectedValue(
        new Error("Invalid token")
      );

      await expect(
        getGoogleAccessToken(req as Request, res as Response)
      ).rejects.toThrow("Invalid token");
    });
  });
  describe("googleAccessToken", () => {
    it("should return user data when idToken is valid", async () => {
      const req = { body: { idToken: "valid-token" } } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;
      const user = { id: 1, name: "John Doe" };

      jest.spyOn(authService, "getUserDataFromToken").mockResolvedValue(user);

      await getGoogleAccessToken(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(user);
    });
    it("should return 400 status code when idToken is missing", async () => {
      const req = { body: {} } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getGoogleAccessToken(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Access token is required",
      });
    });
    it("should return error message when idToken is missing", async () => {
      const req = { body: {} } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;

      await getGoogleAccessToken(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Access token is required",
      });
    });
  });
  describe("getGoogleRefreshToken", () => {
    it("should retrieve and set new tokens when a valid refresh token is provided", async () => {
      const req = {
        body: { refreshToken: "valid-refresh-token" },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      const tokens = {
        refreshToken: "new-refresh-token",
        accessToken: "new-access-token",
      };

      jest.spyOn(authService, "getCustomTokens").mockResolvedValue(tokens);

      await getGoogleRefreshToken(req, res);

      expect(authService.getCustomTokens).toHaveBeenCalledWith(
        "valid-refresh-token"
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "new-refresh-token",
        { httpOnly: true, secure: true }
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "accessToken",
        "new-access-token",
        { httpOnly: true, secure: true }
      );
      expect(res.send).toHaveBeenCalledWith({ tokens });
    });
    it("should return 400 when refresh token is missing", async () => {
      const req = {
        body: {},
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await getGoogleRefreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Refresh token is required",
      });
    });
    // Responds with the correct tokens in the response body
    it("should respond with correct tokens in the response body when a valid refresh token is provided", async () => {
      const req = {
        body: { refreshToken: "valid-refresh-token" },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      const tokens = {
        refreshToken: "new-refresh-token",
        accessToken: "new-access-token",
      };

      jest.spyOn(authService, "getCustomTokens").mockResolvedValue(tokens);

      await getGoogleRefreshToken(req, res);

      expect(authService.getCustomTokens).toHaveBeenCalledWith(
        "valid-refresh-token"
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "new-refresh-token",
        { httpOnly: true, secure: true }
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "accessToken",
        "new-access-token",
        { httpOnly: true, secure: true }
      );
      expect(res.send).toHaveBeenCalledWith({ tokens });
    });
    // Handles invalid or expired refresh tokens
    it("should return error message when no refresh token is provided", async () => {
      const req = {
        body: { refreshToken: "" },
      } as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as Response;

      await getGoogleRefreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Refresh token is required",
      });
      expect(res.send).not.toHaveBeenCalled();
    });
  });
});
