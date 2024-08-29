import * as userRepository from "../../src/modules/users/users.repository";
import * as authService from "../../src/modules/auth/auth.service";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as userService from "../../src/modules/users/users.service"; // Add this line
import config from "../../src/config/index";
import { BaseError } from "../../src/shared/exceptions/base.error";
import { refreshTokens } from "../../src/modules/auth/auth.service";
import { UserRole } from "../../src/shared/enums/user-Role.enum";
import { IUser } from "../../src/modules/users/user.interface";

jest.mock("../../src/modules/users/users.repository");
jest.mock("../../src/modules/users/users.service");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("Auth Service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("signUp Service", () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe",
      role: UserRole.User,
    };

    it("should create a new user, generate tokens, and update the refresh token", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const mockAccessToken = "mockAccessToken";
      const mockRefreshToken = "mockRefreshToken";
      const mockHashedRefreshToken = "mockHashedRefreshToken";

      (userRepository.createUser as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockImplementation((payload, secret, options) =>
        options.expiresIn === config.accessToken.expiresIn
          ? mockAccessToken
          : mockRefreshToken
      );
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedRefreshToken);
      (userRepository.updateUserById as jest.Mock).mockResolvedValue(1);

      const result = await authService.signUp(userData);

      expect(result).toEqual({
        user: mockUser,
        tokens: {
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
        },
      });
      expect(userRepository.createUser).toHaveBeenCalledWith(userData);
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, email: mockUser.email, role: "admin" },
        config.accessToken.secret,
        { expiresIn: config.accessToken.expiresIn }
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser.id, email: mockUser.email, role: "admin" },
        config.refreshToken.secret,
        { expiresIn: config.refreshToken.expiresIn }
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRefreshToken, 10);
      expect(userRepository.updateUserById).toHaveBeenCalledWith(mockUser.id, {
        refreshToken: mockHashedRefreshToken,
      });
    });

    // Test cases for handling errors
    it("should handle error if user creation fails", async () => {
      (userRepository.createUser as jest.Mock).mockRejectedValue(
        new Error("User creation failed")
      );

      await expect(authService.signUp(userData)).rejects.toThrow(
        "User creation failed"
      );
    });

    it("should handle error if token generation fails", async () => {
      const mockUser = { id: 1, email: "test@example.com" };

      (userRepository.createUser as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error("Token generation failed");
      });

      await expect(authService.signUp(userData)).rejects.toThrow(
        "Token generation failed"
      );
    });

    it("should handle error if hashing refresh token fails", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const mockRefreshToken = "mockRefreshToken";

      (userRepository.createUser as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue(mockRefreshToken);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error("Hashing failed"));

      await expect(authService.signUp(userData)).rejects.toThrow(
        "Hashing failed"
      );
    });

    it("should handle error if updating refresh token in database fails", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      const mockRefreshToken = "mockRefreshToken";
      const mockHashedRefreshToken = "mockHashedRefreshToken";

      (userRepository.createUser as jest.Mock).mockResolvedValue(mockUser);
      (jwt.sign as jest.Mock).mockReturnValue(mockRefreshToken);
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedRefreshToken);
      (userRepository.updateUserById as jest.Mock).mockRejectedValue(
        new Error("Database update failed")
      );

      await expect(authService.signUp(userData)).rejects.toThrow(
        "Database update failed"
      );
    });
  });
  describe("logIn Service", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      password: "password",
      refreshToken: "refresh",
      role: UserRole.User,
    };
    const mockTokens = { accessToken: "access", refreshToken: "refresh" };

    it("should return user and tokens when valid credentials are provided", async () => {
      jest
        .spyOn(userService, "validateCredentials")
        .mockResolvedValue(mockUser);
      jest.spyOn(authService, "getTokens").mockResolvedValue(mockTokens);
      jest
        .spyOn(authService, "updateRefreshToken")
        .mockResolvedValue(undefined);

      const result = await authService.logIn({
        email: "test@example.com",
        password: "password",
      });

      expect(result).toEqual({ user: mockUser, tokens: mockTokens });
      expect(userService.validateCredentials).toHaveBeenCalledWith(
        "test@example.com",
        "password"
      );
      expect(authService.getTokens).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email
      );
      expect(authService.updateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        mockTokens.refreshToken
      );
    });

    it("should return user and tokens when valid credentials are provided", async () => {
      jest
        .spyOn(userService, "validateCredentials")
        .mockResolvedValue(mockUser);
      jest.spyOn(authService, "getTokens").mockResolvedValue(mockTokens);
      jest
        .spyOn(authService, "updateRefreshToken")
        .mockResolvedValue(undefined);

      const result = await authService.logIn({
        email: "test@example.com",
        password: "password",
      });

      expect(result).toEqual({ user: mockUser, tokens: mockTokens });
      expect(userService.validateCredentials).toHaveBeenCalledWith(
        "test@example.com",
        "password"
      );
      expect(authService.getTokens).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email
      );
      expect(authService.updateRefreshToken).toHaveBeenCalledWith(
        mockUser.id,
        mockTokens.refreshToken
      );
    });
  });
  describe("refreshTokens Service", () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      refreshToken: "hashedRefreshToken",
    };

    const mockDecodedToken = { userId: 1 };

    beforeEach(() => {
      (userRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
    });

    it("should throw an error if user is not found", async () => {
      (userRepository.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(refreshTokens("validRefreshToken")).rejects.toThrow(
        new BaseError("User not found", 404)
      );
    });

    it("should throw an error if refresh token is invalid", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(refreshTokens("invalidRefreshToken")).rejects.toThrow(
        new BaseError("Invalid refresh token", 401)
      );
    });

    it("should return a new access token if refresh token is valid", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const mockAccessToken = "newAccessToken";
      (jwt.sign as jest.Mock).mockReturnValue(mockAccessToken);

      const result = await refreshTokens("validRefreshToken");

      expect(result).toEqual({ newAccessToken: mockAccessToken });
    });

    it("should handle errors during token verification", async () => {
      const error = new Error("Token verification failed");
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await expect(refreshTokens("validRefreshToken")).rejects.toThrow(
        new BaseError(error.message, 500)
      );
    });
  });
  describe("generateResetToken Service", () => {
    const mockUserId = 1;
    const mockEmail = "test@example.com";
    const mockResetToken = "mockResetToken";
    const mockPayload = { userId: mockUserId, email: mockEmail };

    beforeEach(() => {
      (jwt.sign as jest.Mock).mockReturnValue(mockResetToken);
      (userRepository.updateUserById as jest.Mock).mockResolvedValue(undefined);
    });

    it("should generate and return a reset token", async () => {
      const result = await authService.generateResetToken(
        mockUserId,
        mockEmail
      );

      expect(result).toBe(mockResetToken);
      expect(jwt.sign).toHaveBeenCalledWith(
        mockPayload,
        config.resetToken.secret,
        {
          expiresIn: config.resetToken.expiresIn,
        }
      );
      expect(userRepository.updateUserById).toHaveBeenCalledWith(mockUserId, {
        resetToken: mockResetToken,
      });
    });

    it("should handle errors from userRepository.updateUserById", async () => {
      (userRepository.updateUserById as jest.Mock).mockRejectedValue(
        new Error("Database update failed")
      );

      await expect(
        authService.generateResetToken(mockUserId, mockEmail)
      ).rejects.toThrow(new Error("Database update failed"));
    });

    it("should handle errors from jwt.sign", async () => {
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw new Error("Token generation failed");
      });

      await expect(
        authService.generateResetToken(mockUserId, mockEmail)
      ).rejects.toThrow(new Error("Token generation failed"));
    });
  });
  describe("resetPassword Service", () => {
    it("should return user for valid token", async () => {
      const mockUser = { id: 1 };
      const decodedToken = { userId: 1 };
      jest.spyOn(jwt, "verify").mockReturnValue(decodedToken as any);
      (userRepository.getUserById as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.verifyResetToken("validToken");

      expect(jwt.verify).toHaveBeenCalledWith(
        "validToken",
        config.resetToken.secret
      );
      expect(userRepository.getUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });
    it("should throw error for invalid token", async () => {
      jest.spyOn(jwt, "verify").mockReturnValue(undefined);

      await expect(
        authService.verifyResetToken("invalidToken")
      ).rejects.toThrow(new BaseError("Invalid reset token", 400));
    });

    it("should handle token verification errors", async () => {
      jest.spyOn(jwt, "verify").mockImplementation(() => {
        throw new Error("Token verification error");
      });

      await expect(
        authService.verifyResetToken("invalidToken")
      ).rejects.toThrow(new BaseError("Token verification error", 400));
    });

    it("should throw error if user is not found", async () => {
      const decodedToken = { userId: 1 };
      jest.spyOn(jwt, "verify").mockReturnValue(decodedToken as any);
      (userRepository.getUserById as jest.Mock).mockResolvedValue(null);

      await expect(authService.verifyResetToken("validToken")).rejects.toThrow(
        new BaseError("User not found", 404)
      );
    });

    it("should handle errors during user retrieval", async () => {
      const decodedToken = { userId: 1 };
      jest.spyOn(jwt, "verify").mockReturnValue(decodedToken as any);
      (userRepository.getUserById as jest.Mock).mockRejectedValue(
        new Error("User retrieval error")
      );

      await expect(authService.verifyResetToken("validToken")).rejects.toThrow(
        new Error("User retrieval error")
      );
    });
  });
  describe("resetPassword Service", () => {
    it("should reset password successfully", async () => {
      const mockUserId = 1;
      const mockHashedPassword = "hashedPassword";
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
      (userRepository.updateUserById as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.resetPassword(mockUserId, "newPassword");

      expect(bcrypt.hash).toHaveBeenCalledWith("newPassword", 10);
      expect(userRepository.updateUserById).toHaveBeenCalledWith(mockUserId, {
        password: mockHashedPassword,
      });
      expect(result).toBe("Password reset successfully");
    });

    it("should handle errors from bcrypt.hash", async () => {
      const error = new Error("Hashing failed");
      (bcrypt.hash as jest.Mock).mockRejectedValue(error);

      await expect(authService.resetPassword(1, "newPassword")).rejects.toThrow(
        error
      );
      expect(userRepository.updateUserById).not.toHaveBeenCalled();
    });

    it("should handle errors from userRepository.updateUserById", async () => {
      const mockHashedPassword = "hashedPassword";
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
      const error = new Error("Update failed");
      (userRepository.updateUserById as jest.Mock).mockRejectedValue(error);

      await expect(authService.resetPassword(1, "newPassword")).rejects.toThrow(
        error
      );
    });

    test("should handle unexpected errors", async () => {
      const unexpectedError = new Error("Unexpected error");
      (bcrypt.hash as jest.Mock).mockRejectedValue(unexpectedError);

      await expect(authService.resetPassword(1, "newPassword")).rejects.toThrow(
        unexpectedError
      );
    });
  });
  describe("inviteHr", () => {
    it("should generate a random password and create a new HR user", async () => {
      const email = "test@example.com";
      const mockCreateUser = jest
        .fn()
        .mockResolvedValue({ id: 1, email, role: "hr" });
      (userRepository.createUser as jest.Mock) = mockCreateUser;

      const result = await authService.inviteHr(email);

      expect(result.password).toHaveLength(8);
      expect(userRepository.createUser).toHaveBeenCalledWith({
        email,
        role: "hr",
        firstName: "hr",
        lastName: "User",
        password: result.password,
      });
      expect(result.newUser).toEqual({ id: 1, email, role: "hr" });
    });
    it("should throw an error if HR user already exists", async () => {
      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(true);

      await expect(authService.inviteHr("test@example.com")).rejects.toThrow(
        "User already exists"
      );
    });
    it("should verify role is HR when inviting a new HR user", async () => {
      const email = "hr@example.com";
      const mockUser = {
        id: 1,
        email,
        role: UserRole.HR,
        firstName: "hr",
        lastName: "User",
      };
      const randomPassword = "randomPass";

      jest.spyOn(userRepository, "getUserByEmail").mockResolvedValue(null);
      jest.spyOn(userRepository, "createUser").mockResolvedValue({
        id: 1,
        email: "test@example.com",
        role: UserRole.HR,
        firstName: "hr",
        lastName: "User",
        refreshToken: null as null,
      });
      jest.spyOn(Math, "random").mockReturnValue(0.123456789);

      const result = await authService.inviteHr(email);

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(email);
      expect(userRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ email, role: UserRole.HR })
      );
      expect(result.newUser.role).toBe(UserRole.HR);
    });
  });
  describe("getUserDataFromToken", () => {
    const mockToken = "valid-google-token";
    const mockDecodedUserData = {
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      refreshToken: "refreshToken",
      picture: "http://example.com/picture.jpg",
    };

    beforeEach(() => {
      jest.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should create user with correct data when token is valid", async () => {
      jest
        .spyOn(authService, "verifyGoogleToken")
        .mockResolvedValue(mockDecodedUserData);
      const mockUser = { id: 1, ...mockDecodedUserData, role: UserRole.User };
      jest.spyOn(userRepository, "createUser").mockResolvedValue(mockUser);

      const result = await authService.getUserDataFromToken(mockToken);

      expect(userRepository.createUser).toHaveBeenCalledWith({
        email: mockDecodedUserData.email,
        profilePicture: mockDecodedUserData.picture,
        role: UserRole.User,
        password: "sadasdas",
      });
      expect(result).toEqual(mockUser);
    });

    it("should log user data before creating user", async () => {
      jest
        .spyOn(authService, "verifyGoogleToken")
        .mockResolvedValue(mockDecodedUserData);
      jest.spyOn(userRepository, "createUser").mockResolvedValue({} as any);

      await authService.getUserDataFromToken(mockToken);

      expect(console.log).toHaveBeenCalledWith({
        email: mockDecodedUserData.email,
        profilePicture: mockDecodedUserData.picture,
        role: UserRole.User,
        password: "sadasdas",
      });
    });

    it("should handle errors from createUser", async () => {
      jest
        .spyOn(authService, "verifyGoogleToken")
        .mockResolvedValue(mockDecodedUserData);
      const error = new Error("Database error");
      jest.spyOn(userRepository, "createUser").mockRejectedValue(error);

      await expect(authService.getUserDataFromToken(mockToken)).rejects.toThrow(
        error
      );
    });
  });
});
