import {
  createUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  getUsers,
} from "../../modules/users/users.service";
import * as userRepository from "../../modules/users/users.repository";
import { BaseError } from "../../shared/exceptions/base.error";

jest.mock("../../modules/users/users.repository");

describe("User Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("getUsers", () => {
    it("should return users when repository returns users", async () => {
      // Arrange
      const mockUsers = [{ id: 1, name: "John Doe" }];
      (userRepository.getUsers as jest.Mock).mockResolvedValue(mockUsers);

      // Act
      const users = await getUsers();

      // Assert
      expect(users).toEqual(mockUsers);
    });

    it("should propagate errors from repository", async () => {
      // Arrange
      const mockError = new BaseError("Error fetching users", 500);
      (userRepository.getUsers as jest.Mock).mockRejectedValue(mockError);

      // Act & Assert
      await expect(getUsers()).rejects.toThrow(mockError);
    });
  });
  describe("getUserById", () => {
    it("should return user without password", async () => {
      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        image: "profile.jpg",
      };

      (userRepository.getUserById as jest.Mock).mockResolvedValueOnce(mockUser);

      const result = await getUserById(1);
      expect(result).toEqual(mockUser);
      expect(userRepository.getUserById).toHaveBeenCalledWith(1);
    });

    it("should handle errors from repository", async () => {
      (userRepository.getUserById as jest.Mock).mockRejectedValueOnce(
        new Error("Database error")
      );

      await expect(getUserById(1)).rejects.toThrow("Database error");
    });
  });
  describe("getUserByEmail", () => {
    it("should return a user when found by email", async () => {
      const mockUser = { id: 1, email: "test@example.com" };
      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      const user = await getUserByEmail("test@example.com");

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(user).toEqual(mockUser);
    });

    it("should return null if no user is found", async () => {
      (userRepository.getUserByEmail as jest.Mock).mockResolvedValue(null);

      const user = await getUserByEmail("nonexistent@example.com");

      expect(userRepository.getUserByEmail).toHaveBeenCalledWith(
        "nonexistent@example.com"
      );
      expect(user).toBeNull();
    });

    it("should handle errors from the repository layer", async () => {
      const error = new Error("Repository error");
      (userRepository.getUserByEmail as jest.Mock).mockRejectedValue(error);

      await expect(getUserByEmail("test@example.com")).rejects.toThrow(
        "Repository error"
      );
    });
  });
  describe("createUser", () => {
    it("should call repository and return created user data", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      };
      const mockUser = { email: "test@example.com" };

      (userRepository.createUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await createUser(userData);

      expect(userRepository.createUser).toHaveBeenCalledWith(userData);
      expect(result).toEqual(mockUser);
    });

    it("should handle errors from the repository layer", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      };
      (userRepository.createUser as jest.Mock).mockRejectedValue(
        new Error("Repository error")
      );

      await expect(createUser(userData)).rejects.toThrow("Repository error");
    });
  });
  describe("deleteUser", () => {
    it("should delete a user and return the deleted user data", async () => {
      const userId = 1;
      const mockUser = { id: userId, email: "test@example.com" };

      (userRepository.deleteUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await deleteUser(userId);

      expect(userRepository.deleteUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it("should throw an error if the repository layer throws an error", async () => {
      const userId = 1;

      (userRepository.deleteUser as jest.Mock).mockRejectedValue(
        new BaseError("User not found", 404)
      );

      await expect(deleteUser(userId)).rejects.toThrow(BaseError);
      await expect(deleteUser(userId)).rejects.toHaveProperty(
        "message",
        "User not found"
      );
    });
  });
});
