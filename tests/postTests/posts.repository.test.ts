import Post from "../../src/database/models/post.model";
import {
  createMention,
  createMentions,
  createPost,
  createPostWithMention,
  deletePost,
  fullyUpdatePost,
  getPostById,
  getPosts,
  partiallyUpdatePost,
} from "../../src/modules/posts/posts.repository";
import { ErrorMessage } from "../../src/shared/enums/constants/error-message.enum";
import { BaseError } from "../../src/shared/exceptions/base.error";
import * as userRepository from "../../src/modules/users/users.repository";
import * as postRepo from "../../src/modules/posts/posts.repository";
import Mention from "../../src/database/models/mention.model";

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
        title: "Test Post",
        content: "Test Content",
      };
      const mockCreatedPost = { id: 1, ...mockPostData };

      jest
        .spyOn(userRepository, "getUserById")
        .mockResolvedValue(mockUser as any);
      jest.spyOn(Post, "create").mockResolvedValue(mockCreatedPost as any);

      const result = await createPost(mockPostData);

      expect(result).toEqual(mockCreatedPost);
      expect(userRepository.getUserById).toHaveBeenCalledWith(
        mockPostData.userId
      );
      expect(Post.create).toHaveBeenCalledWith(mockPostData);
    });

    it("should throw BaseError when user is not found", async () => {
      const mockPostData = {
        userId: 999,
        title: "Test Post",
        content: "Test Content",
      };

      jest.spyOn(userRepository, "getUserById").mockResolvedValue(null);

      await expect(createPost(mockPostData)).rejects.toThrow(BaseError);
      await expect(createPost(mockPostData)).rejects.toThrow(
        ErrorMessage.USER_NOT_FOUND
      );
      expect(userRepository.getUserById).toHaveBeenCalledWith(
        mockPostData.userId
      );
      expect(Post.create).not.toHaveBeenCalled();
    });

    it("should throw BaseError when post creation fails", async () => {
      const mockUser = { id: 1, name: "Test User" };
      const mockPostData = {
        userId: 1,
        title: "Test Post",
        content: "Test Content",
      };

      jest
        .spyOn(userRepository, "getUserById")
        .mockResolvedValue(mockUser as any);
      jest.spyOn(Post, "create").mockResolvedValue(null);

      await expect(createPost(mockPostData)).rejects.toThrow(BaseError);
      await expect(createPost(mockPostData)).rejects.toThrow(
        ErrorMessage.FAILED_TO_CREATE_POST
      );
      expect(userRepository.getUserById).toHaveBeenCalledWith(
        mockPostData.userId
      );
      expect(Post.create).toHaveBeenCalledWith(mockPostData);
    });

    it("should throw Error when getUserById throws an error", async () => {
      const mockPostData = {
        userId: 1,
        title: "Test Post",
        content: "Test Content",
      };

      jest
        .spyOn(userRepository, "getUserById")
        .mockRejectedValue(new Error("Database error"));

      await expect(createPost(mockPostData)).rejects.toThrow(Error);
      await expect(createPost(mockPostData)).rejects.toThrow("Database error");
      expect(userRepository.getUserById).toHaveBeenCalledWith(
        mockPostData.userId
      );
      expect(Post.create).not.toHaveBeenCalled();
    });

    it("should throw Error when Post.create throws an error", async () => {
      const mockUser = { id: 1, name: "Test User" };
      const mockPostData = {
        userId: 1,
        title: "Test Post",
        content: "Test Content",
      };

      jest
        .spyOn(userRepository, "getUserById")
        .mockResolvedValue(mockUser as any);
      jest.spyOn(Post, "create").mockRejectedValue(new Error("Database error"));

      await expect(createPost(mockPostData)).rejects.toThrow(Error);
      await expect(createPost(mockPostData)).rejects.toThrow("Database error");
      expect(userRepository.getUserById).toHaveBeenCalledWith(
        mockPostData.userId
      );
      expect(Post.create).toHaveBeenCalledWith(mockPostData);
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
    it("should update both description and image when both are provided", async () => {
      const mockPost = {
        id: 1,
        description: "Old description",
        image: "old-image.jpg",
        save: jest.fn(),
      };
      jest.spyOn(Post, "findByPk").mockResolvedValue(mockPost as any);

      const result = await partiallyUpdatePost(
        1,
        "New description",
        "new-image.jpg"
      );

      expect(Post.findByPk).toHaveBeenCalledWith(1);
      expect(mockPost.description).toBe("New description");
      expect(mockPost.image).toBe("new-image.jpg");
      expect(mockPost.save).toHaveBeenCalled();
      expect(result).toEqual(mockPost);
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
    it("should delete a post when it exists", async () => {
      const mockPost = {
        id: 1,
        title: "Test Post",
        destroy: jest.fn(),
      };
      jest.spyOn(Post, "findByPk").mockResolvedValue(mockPost as any);

      const result = await deletePost(1);

      expect(Post.findByPk).toHaveBeenCalledWith(1);
      expect(mockPost.destroy).toHaveBeenCalled();
      expect(result).toEqual(mockPost);
    });

    it("should throw BaseError when post is not found", async () => {
      jest.spyOn(Post, "findByPk").mockResolvedValue(null);

      await expect(deletePost(999)).rejects.toThrow(BaseError);
      await expect(deletePost(999)).rejects.toThrow(
        ErrorMessage.POST_NOT_FOUND
      );
      expect(Post.findByPk).toHaveBeenCalledWith(999);
    });

    it("should throw Error when findByPk throws an error", async () => {
      jest
        .spyOn(Post, "findByPk")
        .mockRejectedValue(new Error("Database error"));

      await expect(deletePost(1)).rejects.toThrow(Error);
      await expect(deletePost(1)).rejects.toThrow("Database error");
      expect(Post.findByPk).toHaveBeenCalledWith(1);
    });

    it("should throw Error when destroy throws an error", async () => {
      const mockPost = {
        id: 1,
        title: "Test Post",
        destroy: jest.fn().mockRejectedValue(new Error("Destroy error")),
      };
      jest.spyOn(Post, "findByPk").mockResolvedValue(mockPost as any);

      await expect(deletePost(1)).rejects.toThrow(Error);
      await expect(deletePost(1)).rejects.toThrow("Destroy error");
      expect(Post.findByPk).toHaveBeenCalledWith(1);
      expect(mockPost.destroy).toHaveBeenCalled();
    });
  });
  describe("createMentions", () => {
    it("should throw BaseError when post is not found", async () => {
      jest.spyOn(Post, "findByPk").mockResolvedValue(null);

      await expect(createMentions(999, ["John Doe"])).rejects.toThrow(
        BaseError
      );
      await expect(createMentions(999, ["John Doe"])).rejects.toThrow(
        ErrorMessage.POST_NOT_FOUND
      );
      expect(Post.findByPk).toHaveBeenCalledWith(999);
    });
  });
  describe("createMention", () => {
    it("should create a mention when post and user exist", async () => {
      const mockPost = { id: 1, title: "Test Post" };
      const mockUser = { id: 2, name: "Test User" };
      const mockMention = { id: 1, postId: 1, mentionedUserId: 2 };

      jest.spyOn(Post, "findByPk").mockResolvedValue(mockPost as any);
      jest
        .spyOn(userRepository, "getUserById")
        .mockResolvedValue(mockUser as any);
      jest.spyOn(Mention, "create").mockResolvedValue(mockMention as any);
      jest.spyOn(console, "log").mockImplementation();

      const result = await createMention(1, 2);

      expect(Post.findByPk).toHaveBeenCalledWith(1);
      expect(userRepository.getUserById).toHaveBeenCalledWith(2);
      expect(Mention.create).toHaveBeenCalledWith({
        postId: 1,
        mentionedUserId: 2,
      });
      expect(console.log).toHaveBeenCalledWith(mockMention);
      expect(result).toEqual(mockMention);
    });

    it("should throw BaseError when post is not found", async () => {
      jest.spyOn(Post, "findByPk").mockResolvedValue(null);

      await expect(createMention(999, 1)).rejects.toThrow(BaseError);
      await expect(createMention(999, 1)).rejects.toThrow(
        ErrorMessage.POST_NOT_FOUND
      );
      expect(Post.findByPk).toHaveBeenCalledWith(999);
      expect(userRepository.getUserById).not.toHaveBeenCalled();
      expect(Mention.create).not.toHaveBeenCalled();
    });

    it("should throw BaseError when user is not found", async () => {
      const mockPost = { id: 1, title: "Test Post" };
      jest.spyOn(Post, "findByPk").mockResolvedValue(mockPost as any);
      jest.spyOn(userRepository, "getUserById").mockResolvedValue(null);

      await expect(createMention(1, 999)).rejects.toThrow(BaseError);
      await expect(createMention(1, 999)).rejects.toThrow(
        ErrorMessage.USER_NOT_FOUND
      );
      expect(Post.findByPk).toHaveBeenCalledWith(1);
      expect(userRepository.getUserById).toHaveBeenCalledWith(999);
      expect(Mention.create).not.toHaveBeenCalled();
    });

    it("should throw Error when Mention.create fails", async () => {
      const mockPost = { id: 1, title: "Test Post" };
      const mockUser = { id: 2, name: "Test User" };

      jest.spyOn(Post, "findByPk").mockResolvedValue(mockPost as any);
      jest
        .spyOn(userRepository, "getUserById")
        .mockResolvedValue(mockUser as any);
      jest
        .spyOn(Mention, "create")
        .mockRejectedValue(new Error("Creation failed"));

      await expect(createMention(1, 2)).rejects.toThrow(Error);
      await expect(createMention(1, 2)).rejects.toThrow("Creation failed");
      expect(Post.findByPk).toHaveBeenCalledWith(1);
      expect(userRepository.getUserById).toHaveBeenCalledWith(2);
      expect(Mention.create).toHaveBeenCalledWith({
        postId: 1,
        mentionedUserId: 2,
      });
    });
  });
  describe("createPostWithMention", () => {
    it("should create a post with mention and return both", async () => {
      const mockPostData = {
        userId: 1,
        title: "Test Post",
        content: "Test Content",
        description: "Test Description",
        image: "test-image.jpg",
      };
      const mockCreatedPost = { id: 2, ...mockPostData };
      const mockMention = { id: 1, postId: 2, mentionedUserId: 1 };

      jest
        .spyOn(postRepo, "createPost")
        .mockResolvedValue(mockCreatedPost as any);
      jest
        .spyOn(postRepo, "createMention")
        .mockResolvedValue(mockMention as any);

      const result = await createPostWithMention(mockPostData, 1);

      expect(postRepo.createPost).toHaveBeenCalledWith(mockPostData);
      expect(postRepo.createMention).toHaveBeenCalledWith(2, 1);
      expect(result).toEqual({
        post: mockCreatedPost,
        mentions: mockMention,
      });
    });

    it("should throw an error if createPost fails", async () => {
      const mockPostData = {
        userId: 1,
        title: "Test Post",
        content: "Test Content",
        description: "Test Description",
        image: "test-image.jpg",
      };

      jest
        .spyOn(postRepo, "createPost")
        .mockRejectedValue(new Error("Failed to create post"));

      await expect(createPostWithMention(mockPostData, 1)).rejects.toThrow(
        "Failed to create post"
      );
      expect(postRepo.createPost).toHaveBeenCalledWith(mockPostData);
      expect(postRepo.createMention).not.toHaveBeenCalled();
    });
    it("should throw an error if createMention fails", async () => {
      const mockPostData = {
        userId: 1,
        title: "Test Post",
        content: "Test Content",
        description: "Test Description",
        image: "test-image.jpg",
      };
      const mockCreatedPost = { id: 2, ...mockPostData };

      jest
        .spyOn(postRepo, "createPost")
        .mockResolvedValue(mockCreatedPost as any);
      jest
        .spyOn(postRepo, "createMention")
        .mockRejectedValue(new Error("Failed to create mention"));

      await expect(createPostWithMention(mockPostData, 1)).rejects.toThrow(
        "Failed to create mention"
      );
      expect(postRepo.createPost).toHaveBeenCalledWith(mockPostData);
      expect(postRepo.createMention).toHaveBeenCalledWith(2, 1);
    });
  });
});
