import { HttpStatusCode } from "axios";
import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  getUsers,
} from "../../src/modules/users/users.controller";
import * as userService from "../../src/modules/users/users.service";
import { Request, Response } from "express";
import { SuccessMessage } from "../../src/shared/enums/constants/info-message.enum";
import { BaseError } from "../../src/shared/exceptions/base.error";
import { ErrorMessage } from "../../src/shared/enums/constants/error-message.enum";
import { CreateUserDto } from "../../src/modules/users/dtos/create-user.dto";
import { UserRole } from "../../src/shared/enums/user-Role.enum";

jest.mock("../../src/modules/users/users.service"); // Mock the userService module

describe("User Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    nextFunction = jest.fn();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("getUsers Controller ", () => {
    it("should return users when they exist", async () => {
      const mockUsers = [
        { id: "1", name: "User 1" },
        { id: "2", name: "User 2" },
      ];
      (userService.getUsers as jest.Mock).mockResolvedValue(mockUsers);

      await getUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Ok,
        message: SuccessMessage.USER_RETRIEVAL_SUCCESS,
        data: mockUsers,
      });
    });

    it("should throw BaseError when no users are found", async () => {
      (userService.getUsers as jest.Mock).mockResolvedValue(null);

      await expect(
        getUsers(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(
        new BaseError(ErrorMessage.USER_NOT_FOUND, HttpStatusCode.NotFound)
      );
    });

    it("should handle service errors", async () => {
      const error = new Error("Service error");
      (userService.getUsers as jest.Mock).mockRejectedValue(error);

      await expect(
        getUsers(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(error);
    });

    it("should call userService.getUsers", async () => {
      const mockUsers = [{ id: "1", name: "User 1" }];
      (userService.getUsers as jest.Mock).mockResolvedValue(mockUsers);

      await getUsers(mockRequest as Request, mockResponse as Response);

      expect(userService.getUsers).toHaveBeenCalled();
    });
  });
  describe("getUserById", () => {
    it("should handle errors from service", async () => {
      mockRequest.params = { id: "1" };
      (userService.getUserById as jest.Mock).mockRejectedValueOnce(
        new Error("Service error")
      );

      await expect(
        getUserById(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow("Service error");
    });
  });
  describe("getUserByEmail", () => {});
  describe("createUser", () => {
    it("should create a user successfully", async () => {
      const mockUserData: CreateUserDto = {
        firstName: " User",
        lastName: "Test ",
        email: "test@example.com",
        role: UserRole.Admin,
      };
      const mockCreatedUser = { id: "1", ...mockUserData };
      mockRequest.body = mockUserData;
      (userService.createUser as jest.Mock).mockResolvedValue(mockCreatedUser);

      await createUser(mockRequest as Request, mockResponse as Response);

      expect(userService.createUser).toHaveBeenCalledWith(mockUserData);
      expect(mockResponse.send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Created,
        message: SuccessMessage.USER_CREATION_SUCCESS,
        data: mockCreatedUser,
      });
    });

    it("should throw BaseError when user creation fails", async () => {
      const mockUserData: CreateUserDto = {
        firstName: " User",
        lastName: "Test ",
        email: "test@example.com",
        role: UserRole.Admin,
      };
      mockRequest.body = mockUserData;
      (userService.createUser as jest.Mock).mockResolvedValue(null);

      await expect(
        createUser(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(
        new BaseError(
          ErrorMessage.USER_CREATION_FAILED,
          HttpStatusCode.InternalServerError
        )
      );
    });

    it("should handle empty request body", async () => {
      mockRequest.body = {};
      const mockCreatedUser = { id: "1", name: "", email: "" };
      (userService.createUser as jest.Mock).mockResolvedValue(mockCreatedUser);

      await createUser(mockRequest as Request, mockResponse as Response);

      expect(userService.createUser).toHaveBeenCalledWith({});
      expect(mockResponse.send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Created,
        message: SuccessMessage.USER_CREATION_SUCCESS,
        data: mockCreatedUser,
      });
    });

    it("should handle unexpected errors during user creation", async () => {
      const mockUserData: CreateUserDto = {
        firstName: " User",
        lastName: "Test ",
        email: "test@example.com",
        role: UserRole.Admin,
      };
      mockRequest.body = mockUserData;
      (userService.createUser as jest.Mock).mockRejectedValue(
        new Error("Failed to create user")
      );

      await expect(
        createUser(mockRequest as Request, mockResponse as Response)
      ).rejects.toThrow(
        new BaseError(
          ErrorMessage.USER_CREATION_FAILED,
          HttpStatusCode.InternalServerError
        )
      );
    });
  });
});
