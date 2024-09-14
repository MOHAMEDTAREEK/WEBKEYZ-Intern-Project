import Post from "../../src/database/models/post.model";
import {
  createMention,
  createMentions,
  createPost,
  deletePost,
  fullyUpdatePost,
  getPostById,
  getPosts,
  partiallyUpdatePost,
} from "../../src/modules/posts/posts.repository";
import { ErrorMessage } from "../../src/shared/enums/constants/error-message.enum";
import { BaseError } from "../../src/shared/exceptions/base.error";
import * as userRepository from "../../src/modules/users/users.repository";
import { Transaction } from "sequelize";
import * as postService from "../../src/modules/posts/posts.service";

describe("Posts Repository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("getPosts", () => {
    it("should return all posts when posts exist", async () => {
      const mockPosts = [
        { id: 1, title: "Post 1" },
        { id: 2, title: "Post 2" },
      ];
      jest.spyOn(Post, "findAll").mockResolvedValue(mockPosts as any);

      const result = await getPosts();

      expect(result).toEqual(mockPosts);
      expect(Post.findAll).toHaveBeenCalledTimes(1);
    });

    it("should throw BaseError when findAll throws an error", async () => {
      jest
        .spyOn(Post, "findAll")
        .mockRejectedValue(new Error("Database error"));

      await expect(getPosts()).rejects.toThrow(Error);
      await expect(getPosts()).rejects.toThrow("Database error");
    });
  });
  describe("getPostById", () => {
    it("should return a post when it exists", async () => {
      const mockPost = { id: 1, title: "Test Post" };
      jest.spyOn(Post, "findByPk").mockResolvedValue(mockPost as any);

      const result = await getPostById(1);

      expect(result).toEqual(mockPost);
      expect(Post.findByPk).toHaveBeenCalledWith(1);
    });

    it("should throw BaseError when post is not found", async () => {
      jest.spyOn(Post, "findByPk").mockResolvedValue(null);

      await expect(getPostById(999)).rejects.toThrow(BaseError);
      await expect(getPostById(999)).rejects.toThrow(
        ErrorMessage.POST_NOT_FOUND
      );
      expect(Post.findByPk).toHaveBeenCalledWith(999);
    });

    it("should throw BaseError when findByPk throws an error", async () => {
      jest
        .spyOn(Post, "findByPk")
        .mockRejectedValue(new Error("Database error"));

      await expect(getPostById(1)).rejects.toThrow(Error);
      await expect(getPostById(1)).rejects.toThrow("Database error");
    });
  });
  describe("createPost", () => {
    it("should create a post when user exists", async () => {
      const mockUser = { id: 1, name: "Test User" };
      const mockPostData = {
        userId: 1,
        description: "Test Description",
        imageUrls: ["image1.jpg", "image2.jpg"],
      };
      const mockCreatedPost = {
        id: 1,
        ...mockPostData,
        like: 0,
        mentionedUser: [],
      };

      jest
        .spyOn(userRepository, "getUserById")
        .mockResolvedValue(mockUser as any);
      jest.spyOn(Post, "create").mockResolvedValue(mockCreatedPost as any);

      const mockTransaction = {} as Transaction;

      const result = await createPost(
        mockPostData.userId,
        mockPostData.description,
        mockPostData.imageUrls,
        mockTransaction
      );

      expect(result).toEqual(mockCreatedPost);
      expect(userRepository.getUserById).toHaveBeenCalledWith(
        mockPostData.userId
      );
      expect(Post.create).toHaveBeenCalledWith(
        {
          description: mockPostData.description,
          image: mockPostData.imageUrls,
          userId: mockPostData.userId,
          like: 0,
          mentionedUser: [],
        },
        { transaction: mockTransaction }
      );
    });

    it("should throw BaseError when post creation fails", async () => {
      const mockUser = { id: 1, name: "Test User" };
      jest
        .spyOn(userRepository, "getUserById")
        .mockResolvedValue(mockUser as any);
      jest.spyOn(Post, "create").mockResolvedValue(null);

      const mockTransaction = {} as Transaction;

      await expect(
        createPost(1, "Test Description", ["image.jpg"], mockTransaction)
      ).rejects.toThrow(BaseError);
      await expect(
        createPost(1, "Test Description", ["image.jpg"], mockTransaction)
      ).rejects.toThrow(ErrorMessage.FAILED_TO_CREATE_POST);
      expect(userRepository.getUserById).toHaveBeenCalledWith(1);
      expect(Post.create).toHaveBeenCalled();
    });

    it("should create a post with empty image array", async () => {
      const mockUser = { id: 1, name: "Test User" };
      const mockPostData = {
        userId: 1,
        description: "Test Description",
        imageUrls: [],
      };
      const mockCreatedPost = {
        id: 1,
        ...mockPostData,
        like: 0,
        mentionedUser: [],
      };

      jest
        .spyOn(userRepository, "getUserById")
        .mockResolvedValue(mockUser as any);
      jest.spyOn(Post, "create").mockResolvedValue(mockCreatedPost as any);

      const mockTransaction = {} as Transaction;

      const result = await createPost(
        mockPostData.userId,
        mockPostData.description,
        mockPostData.imageUrls,
        mockTransaction
      );

      expect(result).toEqual(mockCreatedPost);
      expect(Post.create).toHaveBeenCalledWith(
        {
          description: mockPostData.description,
          image: [],
          userId: mockPostData.userId,
          like: 0,
          mentionedUser: [],
        },
        { transaction: mockTransaction }
      );
    });
    it("should throw Error when Post.create throws an error", async () => {
      const mockUser = { id: 1, name: "Test User" };
      jest
        .spyOn(userRepository, "getUserById")
        .mockResolvedValue(mockUser as any);
      jest.spyOn(Post, "create").mockRejectedValue(new Error("Database error"));

      const mockTransaction = {} as Transaction;

      await expect(
        createPost(1, "Test Description", ["image.jpg"], mockTransaction)
      ).rejects.toThrow(Error);
      await expect(
        createPost(1, "Test Description", ["image.jpg"], mockTransaction)
      ).rejects.toThrow("Database error");
      expect(userRepository.getUserById).toHaveBeenCalledWith(1);
      expect(Post.create).toHaveBeenCalled();
    });
  });
  describe("fullyUpdatePost", () => {
    it("should update a post when it exists", async () => {
      const mockPost = {
        id: 1,
        title: "Old Title",
        content: "Old Content",
        update: jest.fn(),
      };
      const updatedData = {
        title: "New Title",
        content: "New Content",
      };
      jest.spyOn(Post, "findByPk").mockResolvedValue(mockPost as any);

      const result = await fullyUpdatePost(1, updatedData);

      expect(Post.findByPk).toHaveBeenCalledWith(1);
      expect(mockPost.update).toHaveBeenCalledWith(updatedData);
      expect(result).toEqual(mockPost);
    });

    it("should throw BaseError when post is not found", async () => {
      jest.spyOn(Post, "findByPk").mockResolvedValue(null);

      await expect(
        fullyUpdatePost(999, { title: "New Title" })
      ).rejects.toThrow(BaseError);
      await expect(
        fullyUpdatePost(999, { title: "New Title" })
      ).rejects.toThrow(ErrorMessage.POST_NOT_FOUND);
      expect(Post.findByPk).toHaveBeenCalledWith(999);
    });

    it("should throw Error when findByPk throws an error", async () => {
      jest
        .spyOn(Post, "findByPk")
        .mockRejectedValue(new Error("Database error"));

      await expect(fullyUpdatePost(1, { title: "New Title" })).rejects.toThrow(
        Error
      );
      await expect(fullyUpdatePost(1, { title: "New Title" })).rejects.toThrow(
        "Database error"
      );
      expect(Post.findByPk).toHaveBeenCalledWith(1);
    });

    it("should throw Error when update throws an error", async () => {
      const mockPost = {
        id: 1,
        update: jest.fn().mockRejectedValue(new Error("Update error")),
      };
      jest.spyOn(Post, "findByPk").mockResolvedValue(mockPost as any);

      await expect(fullyUpdatePost(1, { title: "New Title" })).rejects.toThrow(
        Error
      );
      await expect(fullyUpdatePost(1, { title: "New Title" })).rejects.toThrow(
        "Update error"
      );
      expect(Post.findByPk).toHaveBeenCalledWith(1);
      expect(mockPost.update).toHaveBeenCalledWith({ title: "New Title" });
    });
  });
  describe("partiallyUpdatePost", () => {
    // Successfully updates post description
    it("should update the post description when a valid ID and description are provided", async () => {
      const mockPost = {
        id: 1,
        description: "Old Description",
        image: [],
        save: jest.fn(),
      };
      jest.spyOn(Post, "findByPk").mockResolvedValue(mockPost as any);

      const updatedPost = await partiallyUpdatePost(
        1,
        "New Description",
        "new-image.jpg"
      );

      expect(Post.findByPk).toHaveBeenCalledWith(1);
      expect(mockPost.description).toBe("New Description");
      expect(mockPost.save).toHaveBeenCalled();
      expect(updatedPost).toEqual(mockPost);
    });
    it("should throw BaseError when post is not found", async () => {
      jest.spyOn(Post, "findByPk").mockResolvedValue(null);

      await expect(
        partiallyUpdatePost(999, "New description", "new-image.jpg")
      ).rejects.toThrow(BaseError);
      await expect(
        partiallyUpdatePost(999, "New description", "new-image.jpg")
      ).rejects.toThrow(ErrorMessage.POST_NOT_FOUND);
      expect(Post.findByPk).toHaveBeenCalledWith(999);
    });

    it("should throw Error when save throws an error", async () => {
      const mockPost = {
        id: 1,
        description: "Old description",
        image: "old-image.jpg",
        save: jest.fn().mockRejectedValue(new Error("Save error")),
      };
      jest.spyOn(Post, "findByPk").mockResolvedValue(mockPost as any);

      await expect(
        partiallyUpdatePost(1, "New description", "new-image.jpg")
      ).rejects.toThrow(Error);
      await expect(
        partiallyUpdatePost(1, "New description", "new-image.jpg")
      ).rejects.toThrow("Save error");
      expect(Post.findByPk).toHaveBeenCalledWith(1);
      expect(mockPost.save).toHaveBeenCalled();
    });
  });
  describe("deletePost", () => {
    it("should delete uploaded images when deleting a post", async () => {
      const mockPost = {
        id: 1,
        image: ["image1.jpg", "image2.jpg"],
        destroy: jest.fn(),
      };
      jest.spyOn(Post, "findByPk").mockResolvedValue(mockPost as any);
      const mockDeleteUploadedImages = jest.fn();
      jest
        .spyOn(postService, "deleteUploadedImages")
        .mockImplementation(mockDeleteUploadedImages);

      await deletePost(1);

      expect(postService.deleteUploadedImages).toHaveBeenCalledWith([
        "image1.jpg",
        "image2.jpg",
      ]);
      expect(mockPost.destroy).toHaveBeenCalled();
    });

    it("should handle post with no images", async () => {
      const mockPost = {
        id: 1,
        image: [],
        destroy: jest.fn(),
      };
      jest.spyOn(Post, "findByPk").mockResolvedValue(mockPost as any);
      const mockDeleteUploadedImages = jest.fn();
      jest
        .spyOn(postService, "deleteUploadedImages")
        .mockImplementation(mockDeleteUploadedImages);

      await deletePost(1);

      expect(postService.deleteUploadedImages).toHaveBeenCalledWith([]);
      expect(mockPost.destroy).toHaveBeenCalled();
    });

    it("should throw an error if deleteUploadedImages fails", async () => {
      const mockPost = {
        id: 1,
        image: ["image1.jpg"],
        destroy: jest.fn(),
      };
      jest.spyOn(Post, "findByPk").mockResolvedValue(mockPost as any);
      jest
        .spyOn(postService, "deleteUploadedImages")
        .mockRejectedValue(new Error("Failed to delete images"));

      await expect(deletePost(1)).rejects.toThrow("Failed to delete images");
      expect(mockPost.destroy).not.toHaveBeenCalled();
    });
  });
});
