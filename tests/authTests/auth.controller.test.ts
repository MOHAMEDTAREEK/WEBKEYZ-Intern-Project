import { Request, Response } from "express";
import {
  customForgotPassword,
  customInviteHr,
  customLogout,
  customLogin,
  customRefreshTokens,
  customResetPassword,
  customResetPasswordWithoutToken,
  customSignUp,
  getGoogleAccessToken,
} from "../../src/modules/auth/auth.controller";
import * as userService from "../../src/modules/users/users.service";
import * as authService from "../../src/modules/auth/auth.service";
import * as userRepository from "../../src/modules/users/users.repository";
import { LoginDto } from "../../src/modules/auth/dtos/login.dto";
import { BaseError } from "../../src/shared/exceptions/base.error";
import { sendEmail } from "../../src/shared/util/send-email";
import { SignupDto } from "../../src/modules/auth/dtos/signup.dto";
import { UserRole } from "../../src/shared/enums/user-Role.enum";
import { ErrorMessage } from "../../src/shared/enums/constants/error-message.enum";
import { HttpStatusCode } from "axios";
import { SuccessMessage } from "../../src/shared/enums/constants/info-message.enum";

jest.mock("../../src/modules/users/users.service");
jest.mock("../../src/modules/auth/auth.service");
jest.mock("../../src/modules/users/users.repository");
jest.mock("../../src/shared/util/send-email", () => ({
  sendEmail: jest.fn(),
}));

describe("auth Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response> = {} as Partial<Response>;
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
  describe("customSignUp Controller", () => {
    let mockSignupDto: SignupDto;

    beforeEach(() => {
      mockSignupDto = {
        email: "newuser@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        role: UserRole.User,
      };
      req = {};
      req.body = mockSignupDto;
    });

    it("should throw BaseError if user already exists", async () => {
      (userService.getUserByEmail as jest.Mock).mockResolvedValue({ id: 1 });

      await expect(
        customSignUp(req as Request, res as Response)
      ).rejects.toThrow(
        new BaseError(
          ErrorMessage.USER_ALREADY_EXISTS,
          HttpStatusCode.BadRequest
        )
      );

      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        mockSignupDto.email
      );
      expect(authService.signUp).not.toHaveBeenCalled();
    });

    it("should call authService.signUp with correct parameters", async () => {
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (authService.signUp as jest.Mock).mockResolvedValue({
        user: { id: 1 },
        tokens: { accessToken: "mockAccess", refreshToken: "mockRefresh" },
      });

      await customSignUp(req as Request, res as Response);

      expect(authService.signUp).toHaveBeenCalledWith(mockSignupDto);
    });

    it("should set correct cookies with tokens", async () => {
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (authService.signUp as jest.Mock).mockResolvedValue({
        user: { id: 1 },
        tokens: { accessToken: "mockAccess", refreshToken: "mockRefresh" },
      });

      await customSignUp(req as Request, res as Response);

      expect(res.cookie).toHaveBeenCalledWith("refreshToken", "mockRefresh", {
        httpOnly: true,
        secure: true,
      });
      expect(res.cookie).toHaveBeenCalledWith("accessToken", "mockAccess", {
        httpOnly: true,
        secure: true,
      });
    });

    it("should return correct response with status, message, and data", async () => {
      const mockUser = { id: 1 };
      const mockTokens = {
        accessToken: "mockAccess",
        refreshToken: "mockRefresh",
      };
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (authService.signUp as jest.Mock).mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      });

      await customSignUp(req as Request, res as Response);

      expect(res.send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Created,
        message: SuccessMessage.USER_CREATION_SUCCESS,
        data: { user: mockUser, tokens: mockTokens },
      });
    });

    it("should handle errors from authService.signUp", async () => {
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (authService.signUp as jest.Mock).mockRejectedValue(
        new Error("Signup failed")
      );

      await expect(
        customSignUp(req as Request, res as Response)
      ).rejects.toThrow("Signup failed");
    });
  });
  describe("customLogin Controller", () => {
    beforeEach(() => {
      req = {
        body: {
          email: "test@example.com",
          password: "password123",
        } as LoginDto,
      };
    });

    it("should handle case when authService.logIn throws an error", async () => {
      const error = new BaseError(
        "Invalid credentials",
        HttpStatusCode.Unauthorized
      );
      (authService.logIn as jest.Mock).mockRejectedValue(error);

      await expect(
        customLogin(req as Request, res as Response)
      ).rejects.toThrow(error);
      expect(authService.logIn).toHaveBeenCalledWith(req.body);
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it("should set correct cookie options", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const mockTokens = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };
      (authService.logIn as jest.Mock).mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      });

      await customLogin(req as Request, res as Response);

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
    });

    it("should return correct response structure", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const mockTokens = {
        accessToken: "access-token",
        refreshToken: "refresh-token",
      };
      (authService.logIn as jest.Mock).mockResolvedValue({
        user: mockUser,
        tokens: mockTokens,
      });

      await customLogin(req as Request, res as Response);

      expect(res.send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Created,
        message: SuccessMessage.USER_LOGIN_SUCCESS,
        data: { user: mockUser, tokens: mockTokens },
      });
    });
  });
  describe("customRefreshTokens Controller", () => {
    beforeEach(() => {
      req = {
        cookies: {},
      };
    });

    it("should throw an error if refreshToken is not in cookies", async () => {
      await expect(
        customRefreshTokens(req as Request, res as Response)
      ).rejects.toThrow(
        new BaseError(
          ErrorMessage.INVALID_CREDENTIALS,
          HttpStatusCode.Unauthorized
        )
      );
    });

    it("should throw an error if authService.refreshTokens fails to generate a new access token", async () => {
      (req.cookies as { refreshToken?: string }).refreshToken =
        "validRefreshToken";
      (authService.refreshTokens as jest.Mock).mockResolvedValue({
        newAccessToken: null,
      });

      await expect(
        customRefreshTokens(req as Request, res as Response)
      ).rejects.toThrow(
        new BaseError(
          ErrorMessage.FAILED_TO_GENERATE_ACCESS_TOKEN,
          HttpStatusCode.InternalServerError
        )
      );
    });

    it("should set the new access token as a cookie with correct options", async () => {
      const mockNewAccessToken = "newAccessToken123";
      (req.cookies as { refreshToken?: string }).refreshToken =
        "validRefreshToken";
      (authService.refreshTokens as jest.Mock).mockResolvedValue({
        newAccessToken: mockNewAccessToken,
      });

      await customRefreshTokens(req as Request, res as Response);

      expect(res.cookie).toHaveBeenCalledWith(
        "accessToken",
        mockNewAccessToken,
        {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        }
      );
    });

    it("should return a response with correct status, message, and data", async () => {
      const mockNewAccessToken = "newAccessToken123";
      (req.cookies as { refreshToken?: string }).refreshToken =
        "validRefreshToken";
      (authService.refreshTokens as jest.Mock).mockResolvedValue({
        newAccessToken: mockNewAccessToken,
      });

      await customRefreshTokens(req as Request, res as Response);

      expect(res.send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Ok,
        message: SuccessMessage.TOKEN_REFRESH_SUCCESS,
        data: mockNewAccessToken,
      });
    });

    it("should call authService.refreshTokens with the correct refresh token", async () => {
      const mockRefreshToken = "validRefreshToken";
      (req.cookies as { refreshToken?: string }).refreshToken =
        mockRefreshToken;
      (authService.refreshTokens as jest.Mock).mockResolvedValue({
        newAccessToken: "newAccessToken123",
      });

      await customRefreshTokens(req as Request, res as Response);

      expect(authService.refreshTokens).toHaveBeenCalledWith(mockRefreshToken);
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
  describe("customLogout Controller", () => {
    it("should clear both access and refresh token cookies", async () => {
      await customLogout(req as Request, res as Response);

      expect(res.clearCookie).toHaveBeenCalledWith("accessToken");
      expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
    });

    it("should return a response with correct status code and message", async () => {
      await customLogout(req as Request, res as Response);

      expect(res.send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.NoContent,
        message: SuccessMessage.USER_LOGOUT_SUCCESS,
        data: undefined,
      });
    });

    it("should handle errors when clearing cookies", async () => {
      res.clearCookie = jest.fn().mockImplementation(() => {
        throw new Error("Failed to clear cookie");
      });

      await expect(
        customLogout(req as Request, res as Response)
      ).rejects.toThrow("Failed to clear cookie");
    });

    it("should not send a response if clearing cookies fails", async () => {
      res.clearCookie = jest.fn().mockImplementation(() => {
        throw new Error("Failed to clear cookie");
      });

      try {
        await customLogout(req as Request, res as Response);
      } catch (error) {
        expect(res.send).not.toHaveBeenCalled();
      }
    });

    it("should clear cookies even if sending response fails", async () => {
      res.send = jest.fn().mockImplementation(() => {
        throw new Error("Failed to send response");
      });

      try {
        await customLogout(req as Request, res as Response);
      } catch (error) {
        expect(res.clearCookie).toHaveBeenCalledWith("accessToken");
        expect(res.clearCookie).toHaveBeenCalledWith("refreshToken");
      }
    });
  });
  describe("customInviteHr Controller", () => {
    beforeEach(() => {
      req = {
        body: { email: "newhr@example.com" },
      };
      jest.clearAllMocks();
    });

    it("should handle error when getUserByEmail fails", async () => {
      (userRepository.getUserByEmail as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        customInviteHr(req as Request, res as Response)
      ).rejects.toThrow("Database error");
    });

    it("should handle error when inviteHr service fails", async () => {
      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (authService.inviteHr as jest.Mock).mockRejectedValue(
        new Error("Failed to create HR user")
      );

      await expect(
        customInviteHr(req as Request, res as Response)
      ).rejects.toThrow("Failed to create HR user");
    });

    it("should create response with correct status and message", async () => {
      const newUser = { email: "newhr@example.com", password: "tempPass123" };

      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (authService.inviteHr as jest.Mock).mockResolvedValue(newUser);
      (sendEmail as jest.Mock).mockResolvedValue(undefined);

      await customInviteHr(req as Request, res as Response);

      expect(res.send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Ok,
        message: SuccessMessage.Invitation_SENT_SUCCESS,
        data: undefined,
      });
    });

    it("should not send email if inviteHr service fails", async () => {
      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (authService.inviteHr as jest.Mock).mockRejectedValue(
        new Error("Failed to create HR user")
      );

      await expect(
        customInviteHr(req as Request, res as Response)
      ).rejects.toThrow("Failed to create HR user");

      expect(sendEmail).not.toHaveBeenCalled();
    });
  });
  describe("getGoogleAccessToken", () => {
    beforeEach(() => {
      req = {
        body: {},
      };
    });

    it("should throw BaseError if idToken is not provided", async () => {
      await expect(
        getGoogleAccessToken(req as Request, res as Response)
      ).rejects.toThrow(
        new BaseError(
          ErrorMessage.ACCESS_TOKEN_REQUIRED,
          HttpStatusCode.Unauthorized
        )
      );
    });

    it("should handle new user creation and return correct response", async () => {
      const mockIdToken = "valid-id-token";
      const mockUserData = { email: "newuser@example.com", name: "New User" };
      const mockCreatedUser = { id: 1, ...mockUserData };
      const mockAccessToken = "new-access-token";

      req.body.idToken = mockIdToken;

      (authService.getUserDataFromToken as jest.Mock).mockResolvedValue(
        mockUserData
      );
      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.createUser as jest.Mock).mockResolvedValue(
        mockCreatedUser
      );
      (authService.getGoogleToken as jest.Mock).mockResolvedValue(
        mockAccessToken
      );

      await getGoogleAccessToken(req as Request, res as Response);

      expect(authService.getUserDataFromToken).toHaveBeenCalledWith(
        mockIdToken
      );
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        mockUserData.email
      );
      expect(userRepository.createUser).toHaveBeenCalledWith(mockUserData);
      expect(authService.getGoogleToken).toHaveBeenCalledWith(mockUserData);
      expect(res.cookie).toHaveBeenCalledWith("accessToken", mockAccessToken, {
        httpOnly: true,
        secure: true,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Created,
        message: SuccessMessage.USER_CREATION_SUCCESS,
        data: { user: mockCreatedUser, userAccessToken: mockAccessToken },
      });
    });

    it("should handle existing user login and return correct response", async () => {
      const mockIdToken = "valid-id-token";
      const mockUserData = { email: "existinguser@example.com" };
      const mockAccessToken = "existing-user-access-token";

      req.body.idToken = mockIdToken;

      (authService.getUserDataFromToken as jest.Mock).mockResolvedValue(
        mockUserData
      );
      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue({
        id: 2,
        ...mockUserData,
      });
      (authService.loginGoogleUser as jest.Mock).mockResolvedValue(
        mockAccessToken
      );

      await getGoogleAccessToken(req as Request, res as Response);

      expect(authService.getUserDataFromToken).toHaveBeenCalledWith(
        mockIdToken
      );
      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        mockUserData.email
      );
      expect(authService.loginGoogleUser).toHaveBeenCalledWith(
        mockUserData.email
      );
      expect(res.cookie).toHaveBeenCalledWith("accessToken", mockAccessToken, {
        httpOnly: true,
        secure: true,
      });
      expect(res.send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Ok,
        message: SuccessMessage.USER_LOGIN_SUCCESS,
        data: { userAccessToken: mockAccessToken },
      });
    });

    it("should handle errors from getUserDataFromToken", async () => {
      const mockIdToken = "invalid-id-token";
      req.body.idToken = mockIdToken;

      (authService.getUserDataFromToken as jest.Mock).mockRejectedValue(
        new Error("Invalid token")
      );

      await expect(
        getGoogleAccessToken(req as Request, res as Response)
      ).rejects.toThrow("Invalid token");
      expect(userRepository.getUserByEmail).not.toHaveBeenCalled();
      expect(userRepository.createUser).not.toHaveBeenCalled();
      expect(authService.getGoogleToken).not.toHaveBeenCalled();
      expect(authService.loginGoogleUser).not.toHaveBeenCalled();
    });

    it("should handle errors from createUser", async () => {
      const mockIdToken = "valid-id-token";
      const mockUserData = { email: "newuser@example.com", name: "New User" };

      req.body.idToken = mockIdToken;

      (authService.getUserDataFromToken as jest.Mock).mockResolvedValue(
        mockUserData
      );
      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (userRepository.createUser as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        getGoogleAccessToken(req as Request, res as Response)
      ).rejects.toThrow("Database error");
      expect(authService.getGoogleToken).not.toHaveBeenCalled();
      expect(res.cookie).not.toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });
});
