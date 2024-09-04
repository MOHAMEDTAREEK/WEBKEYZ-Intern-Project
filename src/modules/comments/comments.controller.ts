import { Request, Response } from "express";
import * as commentService from "./comments.service";
import { BaseError } from "../../shared/exceptions/base.error";
import { ErrorMessage } from "../../shared/enums/constants/error-message.enum";
import { HttpStatusCode } from "axios";
import { IResponse } from "../../shared/interfaces/IResponse.interface";
import { createResponse } from "../../shared/util/create-response";
import { SuccessMessage } from "../../shared/enums/constants/info-message.enum";
export const getComments = async (req: Request, res: Response) => {
  const comments = await commentService.getComments();
  return res.send(comments);
};

export const createComment = async (req: Request, res: Response) => {
  const commentData = req.body;
  const comment = await commentService.createComment(commentData);
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.COMMENT_CREATION_SUCCESS,
    comment
  );
  return res.send(response);
};

export const fullyUpdateComment = async (req: Request, res: Response) => {
  const commentId = parseInt(req.params.id);
  const commentData = req.body;
  const comment = await commentService.fullyUpdateComment(
    commentId,
    commentData
  );
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.COMMENT_FULL_UPDATE_SUCCESS,
    comment
  );
  return res.send(response);
};

export const partiallyUpdateComment = async (req: Request, res: Response) => {
  const commentId = parseInt(req.params.id);
  const { description } = req.body;
  const comment = await commentService.partiallyUpdateComment(
    commentId,
    description
  );
  if (!comment) {
    throw new BaseError(
      ErrorMessage.COMMENT_NOT_FOUND,
      HttpStatusCode.NotFound
    );
  }
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.COMMENT_Partial_UPDATE_SUCCESS,
    comment
  );
  return res.send(response);
};
export const deleteComment = async (req: Request, res: Response) => {
  const commentId = req.params.id;
  const comment = await commentService.deleteComment(commentId);
  const response: IResponse = createResponse(
    HttpStatusCode.Ok,
    SuccessMessage.COMMENT_DELETION_SUCCESS,
    comment
  );
  return res.send(response);
};
