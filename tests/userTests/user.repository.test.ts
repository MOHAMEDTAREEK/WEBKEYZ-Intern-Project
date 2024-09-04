import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  getUsers,
} from "../../src/modules/users/users.repository";
import User from "../../src/database/models/user.model";
import { BaseError } from "../../src/shared/exceptions/base.error";
import bcrypt from "bcrypt";
import logger from "../../src/shared/util/logger";
import { UserRole } from "../../src/shared/enums/user-Role.enum";
import { HttpStatusCode } from "axios";

jest.mock("../../src/database/models/user.model");
jest.mock("bcrypt");
jest.mock("../../src/shared/util/logger");

describe("User Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("getUsers", () => {
    it("should return users when users are found", async () => {
      // Arrange
      const mockUsers = [{ id: 1, name: "John Doe" }];
      (User.findAll as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      const users = await getUsers();

      // Assert
      expect(users).toEqual(mockUsers);
    });

    it("should throw an error when no users are found", async () => {
      // Arrange
      (User.findAll as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(getUsers()).rejects.toThrow(
        new BaseError("No users found", HttpStatusCode.NotFound)
      );
    });
  });
  describe("getUserById", () => {
    it("should return a user without password", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
      };

      (User.findByPk as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await getUserById(1);
      expect(result).toEqual(mockUser);
      expect(User.findByPk).toHaveBeenCalledWith(1, {
        attributes: { exclude: ["password"] },
      });
    });
  });
  describe("getUserByEmail", () => {
    it("should successfully retrieve a user by email", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const user = await getUserByEmail("test@example.com");

      expect(User.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
      expect(user).toEqual(mockUser);
    });

    it("should handle errors thrown by Sequelize", async () => {
      const error = new Error("Database error");
      (User.findOne as jest.Mock).mockRejectedValue(error);

      await expect(getUserByEmail("test@example.com")).rejects.toThrow(
        "Database error"
      );
    });
  });
  describe("createUser", () => {
    it("should create a user and return user data without password", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        role: UserRole.User,
      };
      const hashedPassword = "hashedpassword";

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const mockUser = {
        ...userData,
        password: hashedPassword,
        toJSON: jest.fn().mockReturnValue({
          email: "test@example.com",
          password: hashedPassword,
        }),
      };

      (User.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await createUser(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(User.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword,
      });
      expect(result).toEqual({
        email: "test@example.com",
      });
      expect(logger.info).toHaveBeenCalledWith(
        `User with email ${userData.email} created successfully.`
      );
    });

    it("should handle errors during user creation", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        role: UserRole.User,
      };
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
      (User.create as jest.Mock).mockRejectedValue(new Error("Creation error"));

      await expect(createUser(userData)).rejects.toThrow("Creation error");
    });
  });
  describe("deleteUser", () => {
    it("should delete a user and return the deleted user data", async () => {
      const userId = 1;
      const mockUser = {
        id: userId,
        email: "test@example.com",
        destroy: jest.fn(),
      };

      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (mockUser.destroy as jest.Mock).mockResolvedValue(mockUser);

      const result = await deleteUser(userId);

      expect(User.findByPk).toHaveBeenCalledWith(userId);
      expect(mockUser.destroy).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it("should throw a BaseError if the user is not found", async () => {
      const userId = 1;

      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(deleteUser(userId)).rejects.toThrow(BaseError);
      await expect(deleteUser(userId)).rejects.toHaveProperty(
        "message",
        "User not found"
      );
    });
  });
});
