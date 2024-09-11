import {
  getNumberOfPostsForUser,
  getUserRecognitionNumber,
  getUsers,
  getUsersByMentionCount,
  searchUsers,
} from "../../src/modules/users/users.repository";
import User from "../../src/database/models/user.model";
import { BaseError } from "../../src/shared/exceptions/base.error";
import { HttpStatusCode } from "axios";
import Post from "../../src/database/models/post.model";

jest.mock("../../src/database/models/user.model");
jest.mock("../../src/database/models/post.model");
jest.mock("bcrypt");

describe("User Repository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should return all users", async () => {
      const mockUsers = [
        { id: 1, name: "User 1" },
        { id: 2, name: "User 2" },
      ];
      (User.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getUsers();

      expect(result).toEqual(mockUsers);
      expect(User.findAll).toHaveBeenCalled();
    });

    it("should throw an error if no users are found", async () => {
      (User.findAll as jest.Mock).mockResolvedValue(null);

      await expect(getUsers()).rejects.toThrow(BaseError);
      await expect(getUsers()).rejects.toHaveProperty(
        "statusCode",
        HttpStatusCode.NotFound
      );
    });
  });

  describe("getUsersByMentionCount", () => {
    it("should return users sorted by mention count", async () => {
      const mockUsers = [
        { id: 1, name: "User 1", mentionCount: 5 },
        { id: 2, name: "User 2", mentionCount: 10 },
      ];
      (User.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const result = await getUsersByMentionCount();

      expect(result).toEqual(mockUsers);
      expect(User.findAll).toHaveBeenCalledWith({
        order: [["mentionCount", "DESC"]],
      });
    });
  });

  describe("searchUsers", () => {
    it("should return users matching the search term", async () => {
      const mockUsers = [{ id: 1, name: "John Doe" }];
      (User.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const result = await searchUsers("John");

      expect(result).toEqual(mockUsers);
      expect(User.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.any(Object),
        })
      );
    });
  });

  describe("getUserRecognitionNumber", () => {
    it("should return the mention count for a user", async () => {
      const mockUser = { id: 1, name: "User 1" };
      const mockMentionCount = { mentionCount: 5 };
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (User.findOne as jest.Mock).mockResolvedValue(mockMentionCount);

      const result = await getUserRecognitionNumber(1);

      expect(result).toEqual(mockMentionCount);
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(User.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        attributes: ["mentionCount"],
      });
    });

    it("should throw an error if user is not found", async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(getUserRecognitionNumber(1)).rejects.toThrow(BaseError);
      await expect(getUserRecognitionNumber(1)).rejects.toHaveProperty(
        "statusCode",
        HttpStatusCode.NotFound
      );
    });
  });

  describe("getNumberOfPostsForUser", () => {
    it("should return the number of posts for a user", async () => {
      const mockUser = { id: 1, name: "User 1" };
      const mockPostCount = 5;
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (Post.count as jest.Mock).mockResolvedValue(mockPostCount);

      const result = await getNumberOfPostsForUser(1);

      expect(result).toEqual(mockPostCount);
      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(Post.count).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });

    it("should throw an error if user is not found", async () => {
      (User.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(getNumberOfPostsForUser(1)).rejects.toThrow(BaseError);
      await expect(getNumberOfPostsForUser(1)).rejects.toHaveProperty(
        "statusCode",
        HttpStatusCode.NotFound
      );
    });
  });
});
