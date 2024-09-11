import { Request, Response } from "express";
import {
  createComment,
  deleteComment,
  fullyUpdateComment,
  getComments,
  partiallyUpdateComment,
} from "../../src/modules/comments/comments.controller";
import * as commentService from "../../src/modules/comments/comments.service";
import { BaseError } from "../../src/shared/exceptions/base.error";
import { HttpStatusCode } from "axios";
import { SuccessMessage } from "../../src/shared/enums/constants/info-message.enum";

describe("commentsController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("getComments", () => {
    it("should return comments when they exist", async () => {
      const mockComments = [{ id: 1, text: "Test comment" }];
      jest.spyOn(commentService, "getComments").mockResolvedValue(mockComments);

      const req = {} as Request;
      const res = {
        send: jest.fn(),
      } as unknown as Response;

      await getComments(req, res);

      expect(commentService.getComments).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(mockComments);
    });

    it("should handle errors from commentService.getComments", async () => {
      const errorMessage = "Database error";
      jest
        .spyOn(commentService, "getComments")
        .mockRejectedValue(new Error(errorMessage));

      const req = {} as Request;
      const res = {} as Response;

      await expect(getComments(req, res)).rejects.toThrow(Error);
      expect(commentService.getComments).toHaveBeenCalled();
    });
  });
  describe("createComment", () => {
    it("should create a comment successfully", async () => {
      const mockCommentData = { text: "New comment" };
      const mockCreatedComment = { id: 1, ...mockCommentData };
      jest
        .spyOn(commentService, "createComment")
        .mockResolvedValue(mockCreatedComment);

      const req = { body: mockCommentData } as Request;
      const res = {
        send: jest.fn(),
      } as unknown as Response;

      await createComment(req, res);

      expect(commentService.createComment).toHaveBeenCalledWith(
        mockCommentData
      );
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          internalStatusCode: HttpStatusCode.Ok,
          message: SuccessMessage.COMMENT_CREATION_SUCCESS,
          data: mockCreatedComment,
        })
      );
    });

    it("should throw BaseError when comment creation fails", async () => {
      const mockCommentData = { text: "Failed comment" };
      jest.spyOn(commentService, "createComment").mockResolvedValue(null);

      const req = { body: mockCommentData } as Request;
      const res = {} as Response;

      await expect(createComment(req, res)).rejects.toThrow(BaseError);
      expect(commentService.createComment).toHaveBeenCalledWith(
        mockCommentData
      );
    });

    it("should handle errors from commentService.createComment", async () => {
      const mockCommentData = { text: "Error comment" };
      jest
        .spyOn(commentService, "createComment")
        .mockRejectedValue(new Error("Service error"));

      const req = { body: mockCommentData } as Request;
      const res = {} as Response;

      await expect(createComment(req, res)).rejects.toThrow(Error);
      expect(commentService.createComment).toHaveBeenCalledWith(
        mockCommentData
      );
    });
  });
});
describe("fullyUpdateComment", () => {
  it("should fully update a comment successfully", async () => {
    const mockCommentId = 1;
    const mockCommentData = { text: "Updated comment" };
    const mockUpdatedComment = { id: mockCommentId, ...mockCommentData };
    jest
      .spyOn(commentService, "fullyUpdateComment")
      .mockResolvedValue(mockUpdatedComment as any);

    const req = {
      params: { id: mockCommentId.toString() },
      body: mockCommentData,
    } as unknown as Request;
    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await fullyUpdateComment(req, res);

    expect(commentService.fullyUpdateComment).toHaveBeenCalledWith(
      mockCommentId,
      mockCommentData
    );
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        internalStatusCode: HttpStatusCode.Ok,
        message: SuccessMessage.COMMENT_FULL_UPDATE_SUCCESS,
        data: mockUpdatedComment,
      })
    );
  });

  it("should handle invalid comment ID", async () => {
    const invalidCommentId = "invalid";
    const mockCommentData = { text: "Invalid ID comment" };

    const req = {
      params: { id: invalidCommentId },
      body: mockCommentData,
    } as unknown as Request;
    const res = {} as Response;

    await expect(fullyUpdateComment(req, res)).rejects.toThrow();
  });

  it("should handle errors from commentService.fullyUpdateComment", async () => {
    const mockCommentId = 1;
    const mockCommentData = { text: "Error comment" };
    jest
      .spyOn(commentService, "fullyUpdateComment")
      .mockRejectedValue(new Error("Service error"));

    const req = {
      params: { id: mockCommentId.toString() },
      body: mockCommentData,
    } as unknown as Request;
    const res = {} as Response;

    await expect(fullyUpdateComment(req, res)).rejects.toThrow(Error);
    expect(commentService.fullyUpdateComment).toHaveBeenCalledWith(
      mockCommentId,
      mockCommentData
    );
  });
});
describe("partiallyUpdateComment", () => {
  it("should partially update a comment successfully", async () => {
    const mockCommentId = 1;
    const mockDescription = "Updated description";
    const mockUpdatedComment = {
      id: mockCommentId,
      description: mockDescription,
    };
    jest
      .spyOn(commentService, "partiallyUpdateComment")
      .mockResolvedValue(mockUpdatedComment as any);

    const req = {
      params: { id: mockCommentId.toString() },
      body: { description: mockDescription },
    } as unknown as Request;
    const res = {
      send: jest.fn(),
    } as unknown as Response;

    await partiallyUpdateComment(req, res);

    expect(commentService.partiallyUpdateComment).toHaveBeenCalledWith(
      mockCommentId,
      mockDescription
    );
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        internalStatusCode: HttpStatusCode.Ok,
        message: SuccessMessage.COMMENT_Partial_UPDATE_SUCCESS,
        data: mockUpdatedComment,
      })
    );
  });

  it("should handle invalid comment ID", async () => {
    const invalidCommentId = "invalid";
    const mockDescription = "Invalid ID comment";

    const req = {
      params: { id: invalidCommentId },
      body: { description: mockDescription },
    } as unknown as Request;
    const res = {} as Response;

    await expect(partiallyUpdateComment(req, res)).rejects.toThrow();
  });

  it("should handle errors from commentService.partiallyUpdateComment", async () => {
    const mockCommentId = 1;
    const mockDescription = "Error comment";
    jest
      .spyOn(commentService, "partiallyUpdateComment")
      .mockRejectedValue(new Error("Service error"));

    const req = {
      params: { id: mockCommentId.toString() },
      body: { description: mockDescription },
    } as unknown as Request;
    const res = {} as Response;

    await expect(partiallyUpdateComment(req, res)).rejects.toThrow(Error);
    expect(commentService.partiallyUpdateComment).toHaveBeenCalledWith(
      mockCommentId,
      mockDescription
    );
  });
  describe("deleteComment", () => {
    it("should delete a comment successfully", async () => {
      const mockCommentId = "1";
      const mockDeletedComment = { id: 1, text: "Deleted comment" };
      jest
        .spyOn(commentService, "deleteComment")
        .mockResolvedValue(mockDeletedComment as any);

      const req = {
        params: { id: mockCommentId },
      } as unknown as Request;
      const res = {
        send: jest.fn(),
      } as unknown as Response;

      await deleteComment(req, res);

      expect(commentService.deleteComment).toHaveBeenCalledWith(mockCommentId);
      expect(res.send).toHaveBeenCalledWith(
        expect.objectContaining({
          internalStatusCode: HttpStatusCode.Ok,
          message: SuccessMessage.COMMENT_DELETION_SUCCESS,
          data: mockDeletedComment,
        })
      );
    });

    it("should throw BaseError when comment is not found", async () => {
      const mockCommentId = "999";
      jest.spyOn(commentService, "deleteComment").mockResolvedValue(null);

      const req = {
        params: { id: mockCommentId },
      } as unknown as Request;
      const res = {} as Response;

      await expect(deleteComment(req, res)).rejects.toThrow(BaseError);
      expect(commentService.deleteComment).toHaveBeenCalledWith(mockCommentId);
    });

    it("should handle errors from commentService.deleteComment", async () => {
      const mockCommentId = "1";
      jest
        .spyOn(commentService, "deleteComment")
        .mockRejectedValue(new Error("Service error"));

      const req = {
        params: { id: mockCommentId },
      } as unknown as Request;
      const res = {} as Response;

      await expect(deleteComment(req, res)).rejects.toThrow(Error);
      expect(commentService.deleteComment).toHaveBeenCalledWith(mockCommentId);
    });
  });
});
