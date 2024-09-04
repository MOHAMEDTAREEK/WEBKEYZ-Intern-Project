import Post from "../../src/database/models/post.model";
import { PostDto } from "../../src/modules/posts/posts.dto";
import * as postRepository from "../../src/modules/posts/posts.repository";
import {
  createPost,
  createPostWithMention,
  deletePost,
  fullyUpdatePost,
  getPostById,
  getPosts,
  partiallyUpdatePost,
} from "../../src/modules/posts/posts.service";
import * as userService from "../../src/modules/users/users.service";
describe("PostsService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("getPosts", () => {
    it("should return posts when repository retrieves them successfully", async () => {
      const mockPosts = [
        { id: 1, content: "Post 1" },
        { id: 2, content: "Post 2" },
      ];
      jest
        .spyOn(postRepository, "getPosts")
        .mockResolvedValueOnce(mockPosts as any);

      const result = await getPosts();

      expect(result).toEqual(mockPosts);
      expect(postRepository.getPosts).toHaveBeenCalledTimes(1);
    });
    it("should return an empty array when repository returns null or undefined", async () => {
      jest.spyOn(postRepository, "getPosts").mockResolvedValue([]);

      const result = await getPosts();

      expect(result).toEqual([]);
      expect(postRepository.getPosts).toHaveBeenCalledTimes(1);
    });
  });
  it("should return posts when repository retrieves them successfully", async () => {
    const mockPosts = [
      { id: 1, content: "Post 1" },
      { id: 2, content: "Post 2" },
    ];
    jest.spyOn(postRepository, "getPosts").mockResolvedValue(mockPosts as any);

    const result = await getPosts();

    expect(result).toEqual(mockPosts);
    expect(postRepository.getPosts).toHaveBeenCalledTimes(1);
  });
  describe("getPostById", () => {
    it("should return a post when repository retrieves it successfully", async () => {
      const mockPost = { id: 1, content: "Test Post" };
      jest
        .spyOn(postRepository, "getPostById")
        .mockResolvedValue(mockPost as any);

      const result = await getPostById(1);

      expect(result).toEqual(mockPost);
      expect(postRepository.getPostById).toHaveBeenCalledWith(1);
      expect(postRepository.getPostById).toHaveBeenCalledTimes(1);
    });

    it("should return null when repository returns null", async () => {
      jest
        .spyOn(postRepository, "getPostById")
        .mockResolvedValue(null as unknown as Post);

      const result = await getPostById(999);

      expect(result).toBeNull();
      expect(postRepository.getPostById).toHaveBeenCalledWith(999);
      expect(postRepository.getPostById).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when repository throws an error", async () => {
      const error = new Error("Database error");
      jest.spyOn(postRepository, "getPostById").mockRejectedValue(error);

      await expect(getPostById(1)).rejects.toThrow("Database error");
      expect(postRepository.getPostById).toHaveBeenCalledWith(1);
      expect(postRepository.getPostById).toHaveBeenCalledTimes(1);
    });
  });
  describe("createPost", () => {
    it("should create a post without mentions when description is empty", async () => {
      const postData: PostDto = {
        description: "Hello @user1 and @user2!",
        userId: 1,
        image: null,
      };
      const createdPost = { id: 1, ...postData };

      jest
        .spyOn(postRepository, "createPost")
        .mockResolvedValue(createdPost as any);
      jest.spyOn(postRepository, "createMentions").mockResolvedValue([]);

      const result = await createPost(postData);

      expect(result).toEqual({ post: createdPost, mentionedUserNames: [] });
      expect(postRepository.createPost).toHaveBeenCalledWith(postData);
      expect(postRepository.createMentions).toHaveBeenCalledWith(1, []);
    });

    it("should create a post without mentions when description is undefined", async () => {
      const postData: PostDto = {
        description: "Hello @user1 and @user2!",
        userId: 1,
        image: null,
      };
      const createdPost = { id: 1, ...postData };

      jest
        .spyOn(postRepository, "createPost")
        .mockResolvedValue(createdPost as any);
      jest.spyOn(postRepository, "createMentions").mockResolvedValue([]);

      const result = await createPost(postData);

      expect(result).toEqual({ post: createdPost, mentionedUserNames: [] });
      expect(postRepository.createPost).toHaveBeenCalledWith(postData);
      expect(postRepository.createMentions).toHaveBeenCalledWith(1, []);
    });

    it("should handle errors from createPost", async () => {
      const postData: PostDto = {
        description: "Hello @user1 and @user2!",
        userId: 1,
        image: null,
      };
      const error = new Error("Failed to create post");

      jest.spyOn(postRepository, "createPost").mockRejectedValue(error);

      await expect(createPost(postData)).rejects.toThrow(
        "Failed to create post"
      );
      expect(postRepository.createPost).toHaveBeenCalledWith(postData);
      expect(postRepository.createMentions).not.toHaveBeenCalled();
    });
  });
  describe("fullyUpdatePost", () => {
    it("should update a post when given valid data", async () => {
      const postId = 1;
      const postData = { content: "Updated content", userId: 2 };
      const updatedPost = { id: postId, ...postData };

      jest
        .spyOn(postRepository, "fullyUpdatePost")
        .mockResolvedValue(updatedPost as any);

      const result = await fullyUpdatePost(postId, postData);

      expect(result).toEqual(updatedPost);
      expect(postRepository.fullyUpdatePost).toHaveBeenCalledWith(
        postId,
        postData
      );
      expect(postRepository.fullyUpdatePost).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when the repository throws an error", async () => {
      const postId = 1;
      const postData = { content: "Updated content", userId: 2 };
      const error = new Error("Database error");

      jest.spyOn(postRepository, "fullyUpdatePost").mockRejectedValue(error);

      await expect(fullyUpdatePost(postId, postData)).rejects.toThrow(
        "Database error"
      );
      expect(postRepository.fullyUpdatePost).toHaveBeenCalledWith(
        postId,
        postData
      );
      expect(postRepository.fullyUpdatePost).toHaveBeenCalledTimes(1);
    });

    it("should update a post with partial data", async () => {
      const postId = 1;
      const partialPostData = { content: "Partially updated content" };
      const updatedPost = {
        id: postId,
        content: "Partially updated content",
        userId: 1,
      };

      jest
        .spyOn(postRepository, "fullyUpdatePost")
        .mockResolvedValue(updatedPost as any);

      const result = await fullyUpdatePost(postId, partialPostData);

      expect(result).toEqual(updatedPost);
      expect(postRepository.fullyUpdatePost).toHaveBeenCalledWith(
        postId,
        partialPostData
      );
      expect(postRepository.fullyUpdatePost).toHaveBeenCalledTimes(1);
    });

    it("should handle empty update data", async () => {
      const postId = 1;
      const emptyPostData = {};
      const unchangedPost = {
        id: postId,
        content: "Original content",
        userId: 1,
      };

      jest
        .spyOn(postRepository, "fullyUpdatePost")
        .mockResolvedValue(unchangedPost as any);

      const result = await fullyUpdatePost(postId, emptyPostData);

      expect(result).toEqual(unchangedPost);
      expect(postRepository.fullyUpdatePost).toHaveBeenCalledWith(
        postId,
        emptyPostData
      );
      expect(postRepository.fullyUpdatePost).toHaveBeenCalledTimes(1);
    });
  });
  describe("partiallyUpdatePost", () => {
    it("should update a post with new description and image", async () => {
      const postId = 1;
      const newDescription = "Updated description";
      const newImage = "new-image.jpg";
      const updatedPost = {
        id: postId,
        description: newDescription,
        image: newImage,
      };

      jest
        .spyOn(postRepository, "partiallyUpdatePost")
        .mockResolvedValue(updatedPost as any);

      const result = await partiallyUpdatePost(
        postId,
        newDescription,
        newImage
      );

      expect(result).toEqual(updatedPost);
      expect(postRepository.partiallyUpdatePost).toHaveBeenCalledWith(
        postId,
        newDescription,
        newImage
      );
      expect(postRepository.partiallyUpdatePost).toHaveBeenCalledTimes(1);
    });

    it("should update a post with only new description", async () => {
      const postId = 2;
      const newDescription = "Only description updated";
      const updatedPost = {
        id: postId,
        description: newDescription,
        image: "existing-image.jpg",
      };

      jest
        .spyOn(postRepository, "partiallyUpdatePost")
        .mockResolvedValue(updatedPost as any);

      const result = await partiallyUpdatePost(postId, newDescription, "");

      expect(result).toEqual(updatedPost);
      expect(postRepository.partiallyUpdatePost).toHaveBeenCalledWith(
        postId,
        newDescription,
        ""
      );
      expect(postRepository.partiallyUpdatePost).toHaveBeenCalledTimes(1);
    });

    it("should update a post with only new image", async () => {
      const postId = 3;
      const newImage = "new-image-only.jpg";
      const updatedPost = {
        id: postId,
        description: "Existing description",
        image: newImage,
      };

      jest
        .spyOn(postRepository, "partiallyUpdatePost")
        .mockResolvedValue(updatedPost as any);

      const result = await partiallyUpdatePost(postId, "", newImage);

      expect(result).toEqual(updatedPost);
      expect(postRepository.partiallyUpdatePost).toHaveBeenCalledWith(
        postId,
        "",
        newImage
      );
      expect(postRepository.partiallyUpdatePost).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when the repository throws an error", async () => {
      const postId = 4;
      const newDescription = "Error case";
      const newImage = "error.jpg";
      const error = new Error("Database error");

      jest
        .spyOn(postRepository, "partiallyUpdatePost")
        .mockRejectedValue(error);

      await expect(
        partiallyUpdatePost(postId, newDescription, newImage)
      ).rejects.toThrow("Database error");
      expect(postRepository.partiallyUpdatePost).toHaveBeenCalledWith(
        postId,
        newDescription,
        newImage
      );
      expect(postRepository.partiallyUpdatePost).toHaveBeenCalledTimes(1);
    });
  });
  describe("deletePost", () => {
    it("should delete a post when given a valid id", async () => {
      const postId = 1;
      const deletedPost = { id: postId, content: "Deleted post" };

      jest
        .spyOn(postRepository, "deletePost")
        .mockResolvedValue(deletedPost as any);

      const result = await deletePost(postId);

      expect(result).toEqual(deletedPost);
      expect(postRepository.deletePost).toHaveBeenCalledWith(postId);
      expect(postRepository.deletePost).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when the repository encounters an error", async () => {
      const postId = 2;
      const error = new Error("Database error");

      jest.spyOn(postRepository, "deletePost").mockRejectedValue(error);

      await expect(deletePost(postId)).rejects.toThrow("Database error");
      expect(postRepository.deletePost).toHaveBeenCalledWith(postId);
      expect(postRepository.deletePost).toHaveBeenCalledTimes(1);
    });

    it("should handle deletion of a post with invalid id type", async () => {
      const invalidId = "invalid" as unknown as number;

      jest
        .spyOn(postRepository, "deletePost")
        .mockRejectedValue(new Error("Invalid id type"));

      await expect(deletePost(invalidId)).rejects.toThrow("Invalid id type");
      expect(postRepository.deletePost).toHaveBeenCalledWith(invalidId);
      expect(postRepository.deletePost).toHaveBeenCalledTimes(1);
    });
  });
  describe("createPostWithMention", () => {
    it("should create a post with mention and return post and mentioned user", async () => {
      const postData: PostDto = {
        description: "Test post mentioning @user1",
        userId: 1,
        image: null,
      };
      const userId = 2;
      const createdPost = { id: 1, ...postData };
      const mentions = [{ id: 1, postId: 1, userId: 2 }];
      const mentionedUser = { id: 2, username: "user1" };

      jest.spyOn(postRepository, "createPostWithMention").mockResolvedValue({
        post: createdPost,
        mentions,
      } as any);
      jest
        .spyOn(userService, "getUserById")
        .mockResolvedValue(mentionedUser as any);

      const result = await createPostWithMention(postData, userId);

      expect(result).toEqual({
        post: createdPost,
        mentionedUser: mentionedUser,
      });
      expect(postRepository.createPostWithMention).toHaveBeenCalledWith(
        postData,
        userId
      );
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
    });

    it("should handle case when no user is mentioned", async () => {
      const postData: PostDto = {
        description: "Test post without mention",
        userId: 1,
        image: null,
      };
      const userId = 2;
      const createdPost = { id: 1, ...postData };

      jest.spyOn(postRepository, "createPostWithMention").mockResolvedValue({
        post: createdPost,
        mentions: [],
      } as any);
      jest.spyOn(userService, "getUserById").mockResolvedValue(null);

      const result = await createPostWithMention(postData, userId);

      expect(result).toEqual({
        post: createdPost,
        mentionedUser: null,
      });
      expect(postRepository.createPostWithMention).toHaveBeenCalledWith(
        postData,
        userId
      );
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
    });

    it("should throw an error when createPostWithMention fails", async () => {
      const postData: PostDto = {
        description: "Test post",
        userId: 1,
        image: null,
      };
      const userId = 2;
      const error = new Error("Failed to create post with mention");

      jest
        .spyOn(postRepository, "createPostWithMention")
        .mockRejectedValue(error);

      await expect(createPostWithMention(postData, userId)).rejects.toThrow(
        "Failed to create post with mention"
      );
      expect(postRepository.createPostWithMention).toHaveBeenCalledWith(
        postData,
        userId
      );
      expect(userService.getUserById).not.toHaveBeenCalled();
    });

    it("should handle case when getUserById fails", async () => {
      const postData: PostDto = {
        description: "Test post mentioning @user1",
        userId: 1,
        image: null,
      };
      const userId = 2;
      const createdPost = { id: 1, ...postData };
      const mentions = [{ id: 1, postId: 1, userId: 2 }];
      const error = new Error("Failed to get user");

      jest.spyOn(postRepository, "createPostWithMention").mockResolvedValue({
        post: createdPost,
        mentions,
      } as any);
      jest.spyOn(userService, "getUserById").mockRejectedValue(error);

      await expect(createPostWithMention(postData, userId)).rejects.toThrow(
        "Failed to get user"
      );
      expect(postRepository.createPostWithMention).toHaveBeenCalledWith(
        postData,
        userId
      );
      expect(userService.getUserById).toHaveBeenCalledWith(userId);
    });
  });
});
