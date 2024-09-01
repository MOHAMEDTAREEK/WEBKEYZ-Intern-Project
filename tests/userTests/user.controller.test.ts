import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  getUsers,
} from "../../src/modules/users/users.controller";
import * as userService from "../../src/modules/users/users.service";
import { Request, Response } from "express";

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
  describe("getUsers", () => {
    it("should return users when service returns users", async () => {
      // Arrange
      const mockUsers = [{ id: 1, name: "John Doe" }];
      const req = {} as Request;
      const res = {
        send: jest.fn(),
      } as unknown as Response;
      (userService.getUsers as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      await getUsers(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith(mockUsers);
    });
    // Handles the case when no users are found
    it("should return an empty list when no users are found", async () => {
      const req = {} as Request;
      const res = {
        send: jest.fn(),
      } as unknown as Response;

      jest.spyOn(userService, "getUsers").mockResolvedValue([]);

      await getUsers(req, res);

      expect(userService.getUsers).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith([]);
    });
    it("should handle error when userService.getUsers() throws an error", async () => {
      const req = {} as Request;
      const res = {
        send: jest.fn(),
      } as unknown as Response;

      const mockError = new Error("Database connection failed");
      jest.spyOn(userService, "getUsers").mockRejectedValue(mockError);

      await expect(getUsers(req, res)).rejects.toThrowError(
        "Database connection failed"
      );
      expect(userService.getUsers).toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
    });
  });
  describe("getUserById", () => {
    it("should return user data", async () => {
      mockRequest.params = { id: "1" };
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
      };
      (userService.getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

      await getUserById(mockRequest as Request, mockResponse as Response);

      expect(userService.getUserById).toHaveBeenCalledWith(1);
      expect(mockResponse.send).toHaveBeenCalledWith(mockUser);
    });

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
  describe("getUserByEmail", () => {
    it("should return user data when found by email", async () => {
      mockRequest.body = { email: "test@example.com" };
      const mockUser = { id: 1, email: "test@example.com" };
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      await getUserByEmail(mockRequest as Request, mockResponse as Response);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockUser);
    });

    it("should return 404 if no user is found", async () => {
      mockRequest.body = { email: "nonexistent@example.com" };
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);

      await getUserByEmail(mockRequest as Request, mockResponse as Response);

      expect(userService.getUserByEmail).toHaveBeenCalledWith(
        "nonexistent@example.com"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith("User not found");
    });
  });
  describe("createUser", () => {
    it("should create a user and return the user data", async () => {
      const userData = { email: "test@example.com", password: "password123" };
      const mockUser = { email: "test@example.com" };

      mockRequest.body = userData;
      (userService.createUser as jest.Mock).mockResolvedValue(mockUser);

      await createUser(mockRequest as Request, mockResponse as Response);

      expect(userService.createUser).toHaveBeenCalledWith(userData);
      expect(mockResponse.send).toHaveBeenCalledWith(mockUser);
    });
  });
  describe("deleteUser", () => {
    it("should delete a user and return the deleted user data", async () => {
      const userId = 1;
      const mockUser = { id: userId, email: "test@example.com" };

      mockRequest.params = { id: userId.toString() };
      (userService.deleteUser as jest.Mock).mockResolvedValue(mockUser);

      await deleteUser(mockRequest as Request, mockResponse as Response);

      expect(userService.deleteUser).toHaveBeenCalledWith(userId);
      expect(mockResponse.send).toHaveBeenCalledWith(mockUser);
    });
  });
});
