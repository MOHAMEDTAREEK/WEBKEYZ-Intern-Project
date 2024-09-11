import { Request, Response } from "express";
import {
  createPost,
  deletePost,
  fullyUpdatePost,
  getMentions,
  getPostById,
  getPosts,
  partiallyUpdatePost,
} from "../../src/modules/posts/posts.controller";
import * as postService from "../../src/modules/posts/posts.service";
import { BaseError } from "../../src/shared/exceptions/base.error";
import { ErrorMessage } from "../../src/shared/enums/constants/error-message.enum";
import { HttpStatusCode } from "axios";
import { SuccessMessage } from "../../src/shared/enums/constants/info-message.enum";
import * as postRepository from "../../src/modules/posts/posts.repository";
import { hash } from "crypto";
import { sequelize } from "../../src/database/models";
import Post from "../../src/database/models/post.model";

jest.mock("../../src/modules/posts/posts.service");

describe("Post Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let send: jest.Mock;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
    };
    send = jest.fn();
    res = {
      send,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("getPosts Controller", () => {
    it("should return posts when they exist", async () => {
      const mockPosts = [{ id: 1, title: "Test Post" }];
      (postService.getPosts as jest.Mock).mockResolvedValue(mockPosts);

      await getPosts(req as Request, res as Response);

      expect(postService.getPosts).toHaveBeenCalled();
      expect(send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Ok,
        message: SuccessMessage.Post_RETRIEVAL_SUCCESS,
        data: mockPosts,
      });
    });

    it("should throw BaseError when posts are not found", async () => {
      (postService.getPosts as jest.Mock).mockResolvedValue(null);

      await expect(getPosts(req as Request, res as Response)).rejects.toThrow(
        new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound)
      );

      expect(postService.getPosts).toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
    });

    it("should handle errors from postService.getPosts", async () => {
      const error = new Error("Database error");
      (postService.getPosts as jest.Mock).mockRejectedValue(error);

      await expect(getPosts(req as Request, res as Response)).rejects.toThrow(
        error
      );

      expect(postService.getPosts).toHaveBeenCalled();
      expect(send).not.toHaveBeenCalled();
    });
  });
  describe("getPostById Controller", () => {
    it("should return a post when it exists", async () => {
      const mockPost = { id: 1, title: "Test Post" };
      req.params = { id: "1" };
      (postService.getPostById as jest.Mock).mockResolvedValue(mockPost);

      await getPostById(req as Request, res as Response);

      expect(postService.getPostById).toHaveBeenCalledWith(1);
      expect(send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Ok,
        message: SuccessMessage.Post_RETRIEVAL_SUCCESS,
        data: mockPost,
      });
    });

    it("should throw BaseError when post is not found", async () => {
      req.params = { id: "999" };
      (postService.getPostById as jest.Mock).mockResolvedValue(null);

      await expect(
        getPostById(req as Request, res as Response)
      ).rejects.toThrow(
        new BaseError(ErrorMessage.POST_NOT_FOUND, HttpStatusCode.NotFound)
      );

      expect(postService.getPostById).toHaveBeenCalledWith(999);
      expect(send).not.toHaveBeenCalled();
    });
    it("should handle errors from postService.getPostById", async () => {
      req.params = { id: "1" };
      const error = new Error("Database error");
      (postService.getPostById as jest.Mock).mockRejectedValue(error);

      await expect(
        getPostById(req as Request, res as Response)
      ).rejects.toThrow(error);

      expect(postService.getPostById).toHaveBeenCalledWith(1);
      expect(send).not.toHaveBeenCalled();
    });
  });
  describe("createPost Controller", () => {
    let status: jest.Mock;
    let transaction: any;
    let commit: jest.Mock;
    let rollback: jest.Mock;

    beforeEach(() => {
      req = {
        body: {
          description: "Test description",
          userId: 1,
        },
        files: [{ filename: "test.jpg" }] as unknown as Express.Multer.File[],
      };
      send = jest.fn();
      status = jest.fn().mockReturnThis();
      res = {
        send,
        status,
      };
      transaction = {
        commit: jest.fn(),
        rollback: jest.fn(),
      };
      commit = jest.fn();
      rollback = jest.fn();
      jest.spyOn(sequelize, "transaction").mockResolvedValue(transaction);
      jest
        .spyOn(postService, "getPostPhotoUrls")
        .mockResolvedValue(["http://test.com/test.jpg"]);
      jest.spyOn(postService, "createPost").mockResolvedValue({
        post: {
          id: 1,
          description: "Test description",
          userId: 1,
          like: 0,
          mentionedUser: [],
          createdAt: new Date("2023-06-01T00:00:00.000Z"),
          updatedAt: new Date("2023-06-01T00:00:00.000Z"),
        } as unknown as Post,
        mentioned: [],
        hashtags: [],
      });
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should create a post successfully with images", async () => {
      await createPost(req as Request, res as Response);

      expect(postService.getPostPhotoUrls).toHaveBeenCalledWith(req.files);
      expect(postService.createPost).toHaveBeenCalledWith(
        {
          description: "Test description",
          userId: 1,
          files: req.files,
        },
        transaction,
        ["http://test.com/test.jpg"]
      );
      expect(transaction.commit).toHaveBeenCalled();
      expect(send).toHaveBeenCalledWith(
        expect.objectContaining({
          internalStatusCode: HttpStatusCode.Created,
          message: SuccessMessage.POST_CREATION_SUCCESS,
          data: expect.objectContaining({
            post: expect.objectContaining({
              id: 1,
              description: "Test description",
            }),
            mentioned: [],
            hashtags: [],
          }),
        })
      );
    });

    it("should handle errors during post creation", async () => {
      const error = new Error("Database error");
      jest.spyOn(postService, "createPost").mockRejectedValue(error);

      await createPost(req as Request, res as Response);

      expect(transaction.rollback).toHaveBeenCalled();
      expect(postService.deleteUploadedImages).toHaveBeenCalledWith([
        "http://test.com/test.jpg",
      ]);
      expect(status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(send).toHaveBeenCalledWith(error);
    });

    it("should create a post without images", async () => {
      req.files = [];
      jest.spyOn(postService, "getPostPhotoUrls").mockResolvedValue([]);

      await createPost(req as Request, res as Response);

      expect(postService.getPostPhotoUrls).toHaveBeenCalledWith([]);
      expect(postService.createPost).toHaveBeenCalledWith(
        {
          description: "Test description",
          userId: 1,
          files: [],
        },
        transaction,
        []
      );
      expect(transaction.commit).toHaveBeenCalled();
      expect(send).toHaveBeenCalledWith(
        expect.objectContaining({
          internalStatusCode: HttpStatusCode.Created,
          message: SuccessMessage.POST_CREATION_SUCCESS,
        })
      );
    });
  });
  describe("fullyUpdatePost Controller", () => {
    it("should fully update a post successfully", async () => {
      const mockPostId = 1;
      const mockPostData = {
        title: "Updated Post",
        content: "Updated Content",
      };
      const mockUpdatedPost = { id: mockPostId, ...mockPostData };
      req.params = { id: mockPostId.toString() };
      req.body = mockPostData;
      (postService.fullyUpdatePost as jest.Mock).mockResolvedValue(
        mockUpdatedPost
      );

      await fullyUpdatePost(req as Request, res as Response);

      expect(postService.fullyUpdatePost).toHaveBeenCalledWith(
        mockPostId,
        mockPostData
      );
      expect(send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Ok,
        message: SuccessMessage.POST_FULL_UPDATE_SUCCESS,
        data: mockUpdatedPost,
      });
    });

    it("should throw BaseError when post update fails", async () => {
      const mockPostId = 1;
      const mockPostData = {
        title: "Updated Post",
        content: "Updated Content",
      };
      req.params = { id: mockPostId.toString() };
      req.body = mockPostData;
      (postService.fullyUpdatePost as jest.Mock).mockResolvedValue(null);

      await expect(
        fullyUpdatePost(req as Request, res as Response)
      ).rejects.toThrow(
        new BaseError(
          ErrorMessage.INTERNAL_SERVER_ERROR,
          HttpStatusCode.InternalServerError
        )
      );

      expect(postService.fullyUpdatePost).toHaveBeenCalledWith(
        mockPostId,
        mockPostData
      );
      expect(send).not.toHaveBeenCalled();
    });

    it("should handle errors from postService.fullyUpdatePost", async () => {
      const mockPostId = 1;
      const mockPostData = {
        title: "Updated Post",
        content: "Updated Content",
      };
      req.params = { id: mockPostId.toString() };
      req.body = mockPostData;
      const error = new Error("Database error");
      (postService.fullyUpdatePost as jest.Mock).mockRejectedValue(error);

      await expect(
        fullyUpdatePost(req as Request, res as Response)
      ).rejects.toThrow(error);

      expect(postService.fullyUpdatePost).toHaveBeenCalledWith(
        mockPostId,
        mockPostData
      );
      expect(send).not.toHaveBeenCalled();
    });
  });
  describe("partiallyUpdatePost Controller", () => {
    it("should partially update a post successfully", async () => {
      const mockPostId = 1;
      const mockPostData = {
        description: "Updated Description",
        image: "new-image.jpg",
      };
      const mockUpdatedPost = { id: mockPostId, ...mockPostData };
      req.params = { id: mockPostId.toString() };
      req.body = mockPostData;
      (postService.partiallyUpdatePost as jest.Mock).mockResolvedValue(
        mockUpdatedPost
      );

      await partiallyUpdatePost(req as Request, res as Response);

      expect(postService.partiallyUpdatePost).toHaveBeenCalledWith(
        mockPostId,
        mockPostData.description,
        mockPostData.image
      );
      expect(send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Ok,
        message: SuccessMessage.POST_Partial_UPDATE_SUCCESS,
        data: mockUpdatedPost,
      });
    });

    it("should throw BaseError when post partial update fails", async () => {
      const mockPostId = 1;
      const mockPostData = { description: "Updated Description" };
      req.params = { id: mockPostId.toString() };
      req.body = mockPostData;
      (postService.partiallyUpdatePost as jest.Mock).mockResolvedValue(null);

      await expect(
        partiallyUpdatePost(req as Request, res as Response)
      ).rejects.toThrow(
        new BaseError(
          ErrorMessage.INTERNAL_SERVER_ERROR,
          HttpStatusCode.InternalServerError
        )
      );

      expect(postService.partiallyUpdatePost).toHaveBeenCalledWith(
        mockPostId,
        mockPostData.description,
        undefined
      );
      expect(send).not.toHaveBeenCalled();
    });

    it("should handle errors from postService.partiallyUpdatePost", async () => {
      const mockPostId = 1;
      const mockPostData = {
        description: "Updated Description",
        image: "new-image.jpg",
      };
      req.params = { id: mockPostId.toString() };
      req.body = mockPostData;
      const error = new Error("Database error");
      (postService.partiallyUpdatePost as jest.Mock).mockRejectedValue(error);

      await expect(
        partiallyUpdatePost(req as Request, res as Response)
      ).rejects.toThrow(error);

      expect(postService.partiallyUpdatePost).toHaveBeenCalledWith(
        mockPostId,
        mockPostData.description,
        mockPostData.image
      );
      expect(send).not.toHaveBeenCalled();
    });

    it("should update only description when image is not provided", async () => {
      const mockPostId = 1;
      const mockPostData = { description: "Updated Description" };
      const mockUpdatedPost = { id: mockPostId, ...mockPostData };
      req.params = { id: mockPostId.toString() };
      req.body = mockPostData;
      (postService.partiallyUpdatePost as jest.Mock).mockResolvedValue(
        mockUpdatedPost
      );

      await partiallyUpdatePost(req as Request, res as Response);

      expect(postService.partiallyUpdatePost).toHaveBeenCalledWith(
        mockPostId,
        mockPostData.description,
        undefined
      );
      expect(send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Ok,
        message: SuccessMessage.POST_Partial_UPDATE_SUCCESS,
        data: mockUpdatedPost,
      });
    });

    it("should update only image when description is not provided", async () => {
      const mockPostId = 1;
      const mockPostData = { image: "new-image.jpg" };
      const mockUpdatedPost = { id: mockPostId, ...mockPostData };
      req.params = { id: mockPostId.toString() };
      req.body = mockPostData;
      (postService.partiallyUpdatePost as jest.Mock).mockResolvedValue(
        mockUpdatedPost
      );

      await partiallyUpdatePost(req as Request, res as Response);

      expect(postService.partiallyUpdatePost).toHaveBeenCalledWith(
        mockPostId,
        undefined,
        mockPostData.image
      );
      expect(send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Ok,
        message: SuccessMessage.POST_Partial_UPDATE_SUCCESS,
        data: mockUpdatedPost,
      });
    });
  });
  describe("deletePost Controller", () => {
    it("should delete a post successfully", async () => {
      const mockPostId = 1;
      const mockDeletedPost = { id: mockPostId, title: "Deleted Post" };
      req.params = { id: mockPostId.toString() };
      (postService.deletePost as jest.Mock).mockResolvedValue(mockDeletedPost);

      await deletePost(req as Request, res as Response);

      expect(postService.deletePost).toHaveBeenCalledWith(mockPostId);
      expect(send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Ok,
        message: SuccessMessage.POST_DELETION_SUCCESS,
        data: mockDeletedPost,
      });
    });

    it("should throw BaseError when post deletion fails", async () => {
      const mockPostId = 1;
      req.params = { id: mockPostId.toString() };
      (postService.deletePost as jest.Mock).mockResolvedValue(null);

      await expect(deletePost(req as Request, res as Response)).rejects.toThrow(
        new BaseError(
          ErrorMessage.INTERNAL_SERVER_ERROR,
          HttpStatusCode.InternalServerError
        )
      );

      expect(postService.deletePost).toHaveBeenCalledWith(mockPostId);
      expect(send).not.toHaveBeenCalled();
    });

    it("should handle errors from postService.deletePost", async () => {
      const mockPostId = 1;
      req.params = { id: mockPostId.toString() };
      const error = new Error("Database error");
      (postService.deletePost as jest.Mock).mockRejectedValue(error);

      await expect(deletePost(req as Request, res as Response)).rejects.toThrow(
        error
      );

      expect(postService.deletePost).toHaveBeenCalledWith(mockPostId);
      expect(send).not.toHaveBeenCalled();
    });
  });
  describe("getMentions Controller", () => {
    it("should return mentions when valid ID is provided", async () => {
      const req = { params: { id: "1" } } as unknown as Request;
      const res = { send: jest.fn() } as unknown as Response;
      const mentions = [{ id: 1, text: "mention1" }];

      jest
        .spyOn(postRepository, "getMentions")
        .mockResolvedValue(mentions as any);

      await getMentions(req, res);

      expect(postRepository.getMentions).toHaveBeenCalledWith(1);
      expect(res.send).toHaveBeenCalledWith({
        internalStatusCode: HttpStatusCode.Ok,
        message: SuccessMessage.MENTIONS_RETRIEVAL_SUCCESS,
        data: mentions,
        errors: undefined,
        dev: undefined,
      });
    });
  });
  // describe("createPostWithMention Controller", () => {
  //   it("should create a post with mention successfully", async () => {
  //     const mockUserId = 1;
  //     const mockPostData = { title: "Test Post", content: "Test Content" };
  //     const mockCreatedPost = { id: 1, ...mockPostData };
  //     const mockMentionedUser = { id: 2, username: "testuser" };
  //     req.params = { userId: mockUserId.toString() };
  //     req.body = mockPostData;
  //     (postService.createPostWithMention as jest.Mock).mockResolvedValue({
  //       post: mockCreatedPost,
  //       mentionedUser: mockMentionedUser,
  //     });

  //     await createPostWithMention(req as Request, res as Response);

  //     expect(postService.createPostWithMention).toHaveBeenCalledWith(
  //       mockPostData,
  //       mockUserId
  //     );
  //     expect(send).toHaveBeenCalledWith({
  //       internalStatusCode: HttpStatusCode.Ok,
  //       message: SuccessMessage.MENTIONS_CREATION_SUCCESS,
  //       data: {
  //         post: mockCreatedPost,
  //         mentionedUser: mockMentionedUser,
  //       },
  //     });
  //   });

  //   it("should handle errors from postService.createPostWithMention", async () => {
  //     const mockUserId = 1;
  //     const mockPostData = { title: "Test Post", content: "Test Content" };
  //     req.params = { userId: mockUserId.toString() };
  //     req.body = mockPostData;
  //     const error = new Error("Database error");
  //     (postService.createPostWithMention as jest.Mock).mockRejectedValue(error);

  //     await expect(
  //       createPostWithMention(req as Request, res as Response)
  //     ).rejects.toThrow(error);

  //     expect(postService.createPostWithMention).toHaveBeenCalledWith(
  //       mockPostData,
  //       mockUserId
  //     );
  //     expect(send).not.toHaveBeenCalled();
  //   });

  //   it("should handle case when no mentioned user is found", async () => {
  //     const mockUserId = 1;
  //     const mockPostData = { title: "Test Post", content: "Test Content" };
  //     const mockCreatedPost = { id: 1, ...mockPostData };
  //     req.params = { userId: mockUserId.toString() };
  //     req.body = mockPostData;
  //     (postService.createPostWithMention as jest.Mock).mockResolvedValue({
  //       post: mockCreatedPost,
  //       mentionedUser: null,
  //     });

  //     await createPostWithMention(req as Request, res as Response);

  //     expect(postService.createPostWithMention).toHaveBeenCalledWith(
  //       mockPostData,
  //       mockUserId
  //     );
  //     expect(send).toHaveBeenCalledWith({
  //       internalStatusCode: HttpStatusCode.Ok,
  //       message: SuccessMessage.MENTIONS_CREATION_SUCCESS,
  //       data: {
  //         post: mockCreatedPost,
  //         mentionedUser: null,
  //       },
  //     });
  //   });
  // });
});
