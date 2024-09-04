import { HttpStatusCode } from "axios";
import Comment from "../../src/database/models/comment.model";
import {
  createComment,
  deleteComment,
  fullyUpdateComment,
  getComments,
  partiallyUpdateComment,
} from "../../src/modules/comments/comments.repository";
import { ErrorMessage } from "../../src/shared/enums/constants/error-message.enum";
import { BaseError } from "../../src/shared/exceptions/base.error";
import * as postRepository from "../../src/modules/posts/posts.repository";
import * as usersRepository from "../../src/modules/users/users.repository";
describe("Comments Repository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("getComments", () => {
    it("should return all comments", async () => {
      const mockComments = [
        { id: 1, content: "Test comment 1" },
        { id: 2, content: "Test comment 2" },
      ];
      jest.spyOn(Comment, "findAll").mockResolvedValue(mockComments as any);

      const result = await getComments();

      expect(result).toEqual(mockComments);
      expect(Comment.findAll).toHaveBeenCalledTimes(1);
    });

    it("should return an empty array when findAll returns an empty array", async () => {
      jest.spyOn(Comment, "findAll").mockResolvedValue([]);

      const result = await getComments();

      expect(result).toEqual([]);
      expect(Comment.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
describe("createComment", () => {
  const mockCommentData = {
    postId: 1,
    userId: 1,
    content: "Test comment",
  };

  it("should create a comment when post and user exist", async () => {
    const mockPost = { id: 1, title: "Test Post" };
    const mockUser = { id: 1, name: "Test User" };
    const mockCreatedComment = { id: 1, ...mockCommentData };

    jest
      .spyOn(postRepository, "getPostById")
      .mockResolvedValue(mockPost as any);
    jest
      .spyOn(usersRepository, "getUserById")
      .mockResolvedValue(mockUser as any);
    jest.spyOn(Comment, "create").mockResolvedValue(mockCreatedComment as any);

    const result = await createComment(mockCommentData as any);

    expect(result).toEqual(mockCreatedComment);
    expect(postRepository.getPostById).toHaveBeenCalledWith(
      mockCommentData.postId
    );
    expect(usersRepository.getUserById).toHaveBeenCalledWith(
      mockCommentData.userId
    );
    expect(Comment.create).toHaveBeenCalledWith(mockCommentData);
  });

  it("should throw BaseError when comment creation fails", async () => {
    const mockPost = { id: 1, title: "Test Post" };
    const mockUser = { id: 1, name: "Test User" };
    jest
      .spyOn(postRepository, "getPostById")
      .mockResolvedValue(mockPost as any);
    jest
      .spyOn(usersRepository, "getUserById")
      .mockResolvedValue(mockUser as any);
    jest.spyOn(Comment, "create").mockResolvedValue(null);

    await expect(createComment(mockCommentData as any)).rejects.toThrow(
      new BaseError(
        ErrorMessage.COMMENT_CREATION_FAILED,
        HttpStatusCode.InternalServerError
      )
    );
    expect(postRepository.getPostById).toHaveBeenCalledWith(
      mockCommentData.postId
    );
    expect(usersRepository.getUserById).toHaveBeenCalledWith(
      mockCommentData.userId
    );
    expect(Comment.create).toHaveBeenCalledWith(mockCommentData);
  });
  describe("fullyUpdateComment", () => {
    const mockCommentId = 1;
    const mockCommentData = {
      content: "Updated comment content",
    };

    it("should update the comment when it exists", async () => {
      const mockComment = {
        id: mockCommentId,
        content: "Original content",
        update: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Comment, "findByPk").mockResolvedValue(mockComment as any);

      const result = await fullyUpdateComment(mockCommentId, mockCommentData);

      expect(Comment.findByPk).toHaveBeenCalledWith(mockCommentId);
      expect(mockComment.update).toHaveBeenCalledWith(mockCommentData);
      expect(result).toEqual(mockComment);
    });

    it("should throw BaseError when comment is not found", async () => {
      jest.spyOn(Comment, "findByPk").mockResolvedValue(null);

      await expect(
        fullyUpdateComment(mockCommentId, mockCommentData)
      ).rejects.toThrow(
        new BaseError(ErrorMessage.COMMENT_NOT_FOUND, HttpStatusCode.NotFound)
      );

      expect(Comment.findByPk).toHaveBeenCalledWith(mockCommentId);
    });

    it("should throw an error when update fails", async () => {
      const mockComment = {
        id: mockCommentId,
        content: "Original content",
        update: jest.fn().mockRejectedValue(new Error("Update failed")),
      };

      jest.spyOn(Comment, "findByPk").mockResolvedValue(mockComment as any);

      await expect(
        fullyUpdateComment(mockCommentId, mockCommentData)
      ).rejects.toThrow("Update failed");

      expect(Comment.findByPk).toHaveBeenCalledWith(mockCommentId);
      expect(mockComment.update).toHaveBeenCalledWith(mockCommentData);
    });

    it("should update the comment with empty data", async () => {
      const mockComment = {
        id: mockCommentId,
        content: "Original content",
        update: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Comment, "findByPk").mockResolvedValue(mockComment as any);

      const result = await fullyUpdateComment(mockCommentId, {});

      expect(Comment.findByPk).toHaveBeenCalledWith(mockCommentId);
      expect(mockComment.update).toHaveBeenCalledWith({});
      expect(result).toEqual(mockComment);
    });
  });
  describe("partiallyUpdateComment", () => {
    const mockCommentId = 1;
    const mockDescription = "Updated description";

    it("should update the comment description when it exists", async () => {
      const mockComment = {
        id: mockCommentId,
        description: "Original description",
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Comment, "findByPk").mockResolvedValue(mockComment as any);

      const result = await partiallyUpdateComment(
        mockCommentId,
        mockDescription
      );

      expect(Comment.findByPk).toHaveBeenCalledWith(mockCommentId);
      expect(mockComment.description).toBe(mockDescription);
      expect(mockComment.save).toHaveBeenCalled();
      expect(result).toEqual(mockComment);
    });

    it("should throw BaseError when comment is not found", async () => {
      jest.spyOn(Comment, "findByPk").mockResolvedValue(null);

      await expect(
        partiallyUpdateComment(mockCommentId, mockDescription)
      ).rejects.toThrow(
        new BaseError(ErrorMessage.COMMENT_NOT_FOUND, HttpStatusCode.NotFound)
      );

      expect(Comment.findByPk).toHaveBeenCalledWith(mockCommentId);
    });

    it("should not update the description when it is undefined", async () => {
      const mockComment = {
        id: mockCommentId,
        description: "Original description",
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Comment, "findByPk").mockResolvedValue(mockComment as any);

      const result = await partiallyUpdateComment(
        mockCommentId,
        undefined as any
      );

      expect(Comment.findByPk).toHaveBeenCalledWith(mockCommentId);
      expect(mockComment.description).toBe("Original description");
      expect(mockComment.save).toHaveBeenCalled();
      expect(result).toEqual(mockComment);
    });

    it("should throw an error when save fails", async () => {
      const mockComment = {
        id: mockCommentId,
        description: "Original description",
        save: jest.fn().mockRejectedValue(new Error("Save failed")),
      };

      jest.spyOn(Comment, "findByPk").mockResolvedValue(mockComment as any);

      await expect(
        partiallyUpdateComment(mockCommentId, mockDescription)
      ).rejects.toThrow("Save failed");

      expect(Comment.findByPk).toHaveBeenCalledWith(mockCommentId);
      expect(mockComment.description).toBe(mockDescription);
      expect(mockComment.save).toHaveBeenCalled();
    });
  });
  describe("deleteComment", () => {
    const mockCommentId = "1";

    it("should delete the comment when it exists", async () => {
      const mockComment = {
        id: mockCommentId,
        content: "Test comment",
        destroy: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Comment, "findByPk").mockResolvedValue(mockComment as any);

      const result = await deleteComment(mockCommentId);

      expect(Comment.findByPk).toHaveBeenCalledWith(mockCommentId);
      expect(mockComment.destroy).toHaveBeenCalled();
      expect(result).toEqual(mockComment);
    });

    it("should return null when comment is not found", async () => {
      jest.spyOn(Comment, "findByPk").mockResolvedValue(null);

      const result = await deleteComment(mockCommentId);

      expect(Comment.findByPk).toHaveBeenCalledWith(mockCommentId);
      expect(result).toBeNull();
    });

    it("should handle errors during comment deletion", async () => {
      const mockComment = {
        id: mockCommentId,
        content: "Test comment",
        destroy: jest.fn().mockRejectedValue(new Error("Deletion failed")),
      };

      jest.spyOn(Comment, "findByPk").mockResolvedValue(mockComment as any);

      await expect(deleteComment(mockCommentId)).rejects.toThrow(
        "Deletion failed"
      );

      expect(Comment.findByPk).toHaveBeenCalledWith(mockCommentId);
      expect(mockComment.destroy).toHaveBeenCalled();
    });

    it("should handle non-string comment IDs", async () => {
      const nonStringId = 123 as any;
      const mockComment = {
        id: nonStringId,
        content: "Test comment",
        destroy: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Comment, "findByPk").mockResolvedValue(mockComment as any);

      const result = await deleteComment(nonStringId);

      expect(Comment.findByPk).toHaveBeenCalledWith(nonStringId);
      expect(mockComment.destroy).toHaveBeenCalled();
      expect(result).toEqual(mockComment);
    });
  });
});
