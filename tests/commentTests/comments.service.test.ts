import * as commentRepository from "../../src/modules/comments/comments.repository";
import {
  createComment,
  deleteComment,
  fullyUpdateComment,
  getComments,
  partiallyUpdateComment,
} from "../../src/modules/comments/comments.service";
describe("comments.service", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("getComments", () => {
    it("should return an array of comments", async () => {
      const mockComments = [{ id: 1, text: "Test comment" }];
      jest
        .spyOn(commentRepository, "getComments")
        .mockResolvedValue(mockComments as any);

      const result = await getComments();

      expect(result).toEqual(mockComments);
      expect(commentRepository.getComments).toHaveBeenCalledTimes(1);
    });

    it("should return an empty array when no comments are found", async () => {
      jest.spyOn(commentRepository, "getComments").mockResolvedValue([]);

      const result = await getComments();

      expect(result).toEqual([]);
      expect(commentRepository.getComments).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when commentRepository.getComments fails", async () => {
      const error = new Error("Database error");
      jest.spyOn(commentRepository, "getComments").mockRejectedValue(error);

      await expect(getComments()).rejects.toThrow("Database error");
      expect(commentRepository.getComments).toHaveBeenCalledTimes(1);
    });
  });
  describe("createComment", () => {
    it("should create a new comment", async () => {
      const mockCommentData = { text: "New comment", userId: 1 };
      const mockCreatedComment = { id: 1, ...mockCommentData };
      jest
        .spyOn(commentRepository, "createComment")
        .mockResolvedValue(mockCreatedComment as any);

      const result = await createComment(mockCommentData as any);

      expect(result).toEqual(mockCreatedComment);
      expect(commentRepository.createComment).toHaveBeenCalledWith(
        mockCommentData
      );
      expect(commentRepository.createComment).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when commentRepository.createComment fails", async () => {
      const mockCommentData = { text: "New comment", userId: 1 };
      const error = new Error("Failed to create comment");
      jest.spyOn(commentRepository, "createComment").mockRejectedValue(error);

      await expect(createComment(mockCommentData as any)).rejects.toThrow(
        "Failed to create comment"
      );
      expect(commentRepository.createComment).toHaveBeenCalledWith(
        mockCommentData
      );
      expect(commentRepository.createComment).toHaveBeenCalledTimes(1);
    });

    it("should handle empty comment data", async () => {
      const mockCommentData = {};
      const mockCreatedComment = { id: 1 };
      jest
        .spyOn(commentRepository, "createComment")
        .mockResolvedValue(mockCreatedComment as any);

      const result = await createComment(mockCommentData as any);

      expect(result).toEqual(mockCreatedComment);
      expect(commentRepository.createComment).toHaveBeenCalledWith(
        mockCommentData
      );
      expect(commentRepository.createComment).toHaveBeenCalledTimes(1);
    });
  });
  describe("fullyUpdateComment", () => {
    it("should update a comment and return the updated comment", async () => {
      const mockCommentId = 1;
      const mockCommentData = { text: "Updated comment", userId: 2 };
      const mockUpdatedComment = { id: mockCommentId, ...mockCommentData };
      jest
        .spyOn(commentRepository, "fullyUpdateComment")
        .mockResolvedValue(mockUpdatedComment as any);

      const result = await fullyUpdateComment(mockCommentId, mockCommentData);

      expect(result).toEqual(mockUpdatedComment);
      expect(commentRepository.fullyUpdateComment).toHaveBeenCalledWith(
        mockCommentId,
        mockCommentData
      );
      expect(commentRepository.fullyUpdateComment).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when commentRepository.fullyUpdateComment fails", async () => {
      const mockCommentId = 1;
      const mockCommentData = { text: "Updated comment", userId: 2 };
      const error = new Error("Failed to update comment");
      jest
        .spyOn(commentRepository, "fullyUpdateComment")
        .mockRejectedValue(error);

      await expect(
        fullyUpdateComment(mockCommentId, mockCommentData)
      ).rejects.toThrow("Failed to update comment");
      expect(commentRepository.fullyUpdateComment).toHaveBeenCalledWith(
        mockCommentId,
        mockCommentData
      );
      expect(commentRepository.fullyUpdateComment).toHaveBeenCalledTimes(1);
    });

    it("should handle updating a comment with partial data", async () => {
      const mockCommentId = 1;
      const mockCommentData = { text: "Partially updated comment" };
      const mockUpdatedComment = {
        id: mockCommentId,
        ...mockCommentData,
        userId: 1,
      };
      jest
        .spyOn(commentRepository, "fullyUpdateComment")
        .mockResolvedValue(mockUpdatedComment as any);

      const result = await fullyUpdateComment(mockCommentId, mockCommentData);

      expect(result).toEqual(mockUpdatedComment);
      expect(commentRepository.fullyUpdateComment).toHaveBeenCalledWith(
        mockCommentId,
        mockCommentData
      );
      expect(commentRepository.fullyUpdateComment).toHaveBeenCalledTimes(1);
    });
  });
  describe("partiallyUpdateComment", () => {
    it("should partially update a comment and return the updated comment", async () => {
      const mockCommentId = 1;
      const mockDescription = "Partially updated description";
      const mockUpdatedComment = {
        id: mockCommentId,
        text: mockDescription,
        userId: 1,
      };
      jest
        .spyOn(commentRepository, "partiallyUpdateComment")
        .mockResolvedValue(mockUpdatedComment as any);

      const result = await partiallyUpdateComment(
        mockCommentId,
        mockDescription
      );

      expect(result).toEqual(mockUpdatedComment);
      expect(commentRepository.partiallyUpdateComment).toHaveBeenCalledWith(
        mockCommentId,
        mockDescription
      );
      expect(commentRepository.partiallyUpdateComment).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when commentRepository.partiallyUpdateComment fails", async () => {
      const mockCommentId = 1;
      const mockDescription = "Partially updated description";
      const error = new Error("Failed to partially update comment");
      jest
        .spyOn(commentRepository, "partiallyUpdateComment")
        .mockRejectedValue(error);

      await expect(
        partiallyUpdateComment(mockCommentId, mockDescription)
      ).rejects.toThrow("Failed to partially update comment");
      expect(commentRepository.partiallyUpdateComment).toHaveBeenCalledWith(
        mockCommentId,
        mockDescription
      );
      expect(commentRepository.partiallyUpdateComment).toHaveBeenCalledTimes(1);
    });

    it("should handle updating a comment with an empty description", async () => {
      const mockCommentId = 1;
      const mockDescription = "";
      const mockUpdatedComment = {
        id: mockCommentId,
        text: mockDescription,
        userId: 1,
      };
      jest
        .spyOn(commentRepository, "partiallyUpdateComment")
        .mockResolvedValue(mockUpdatedComment as any);

      const result = await partiallyUpdateComment(
        mockCommentId,
        mockDescription
      );

      expect(result).toEqual(mockUpdatedComment);
      expect(commentRepository.partiallyUpdateComment).toHaveBeenCalledWith(
        mockCommentId,
        mockDescription
      );
      expect(commentRepository.partiallyUpdateComment).toHaveBeenCalledTimes(1);
    });
  });
  describe("deleteComment", () => {
    it("should delete a comment and return the deleted comment", async () => {
      const mockCommentId = "1";
      const mockDeletedComment = {
        id: mockCommentId,
        text: "Deleted comment",
        userId: 1,
      };
      jest
        .spyOn(commentRepository, "deleteComment")
        .mockResolvedValue(mockDeletedComment as any);

      const result = await deleteComment(mockCommentId);

      expect(result).toEqual(mockDeletedComment);
      expect(commentRepository.deleteComment).toHaveBeenCalledWith(
        mockCommentId
      );
      expect(commentRepository.deleteComment).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when commentRepository.deleteComment fails", async () => {
      const mockCommentId = "1";
      const error = new Error("Failed to delete comment");
      jest.spyOn(commentRepository, "deleteComment").mockRejectedValue(error);

      await expect(deleteComment(mockCommentId)).rejects.toThrow(
        "Failed to delete comment"
      );
      expect(commentRepository.deleteComment).toHaveBeenCalledWith(
        mockCommentId
      );
      expect(commentRepository.deleteComment).toHaveBeenCalledTimes(1);
    });

    it("should handle deleting a non-existent comment", async () => {
      const mockCommentId = "999";
      jest.spyOn(commentRepository, "deleteComment").mockResolvedValue(null);

      const result = await deleteComment(mockCommentId);

      expect(result).toBeNull();
      expect(commentRepository.deleteComment).toHaveBeenCalledWith(
        mockCommentId
      );
      expect(commentRepository.deleteComment).toHaveBeenCalledTimes(1);
    });

    it("should handle deleting a comment with an invalid ID format", async () => {
      const mockCommentId = "invalid-id";
      const error = new Error("Invalid comment ID format");
      jest.spyOn(commentRepository, "deleteComment").mockRejectedValue(error);

      await expect(deleteComment(mockCommentId)).rejects.toThrow(
        "Invalid comment ID format"
      );
      expect(commentRepository.deleteComment).toHaveBeenCalledWith(
        mockCommentId
      );
      expect(commentRepository.deleteComment).toHaveBeenCalledTimes(1);
    });
  });
});
