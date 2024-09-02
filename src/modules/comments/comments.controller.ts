import { Request, Response } from "express";
import * as commentService from "./comments.service";
export const getComments = async (req: Request, res: Response) => {
  const comments = await commentService.getComments();
  return res.send(comments);
};

export const createComment = async (req: Request, res: Response) => {
  const commentData = req.body;
  const comment = await commentService.createComment(commentData);
  return res.send(comment);
};

export const fullyUpdateComment = async (req: Request, res: Response) => {
  const commentId = parseInt(req.params.id);
  const commentData = req.body;
  const comment = await commentService.fullyUpdateComment(
    commentId,
    commentData
  );
  return res.send(comment);
};

export const partiallyUpdateComment = async (req: Request, res: Response) => {
  const commentId = parseInt(req.params.id);
  const { description } = req.body;
  const comment = await commentService.partiallyUpdateComment(
    commentId,
    description
  );
  if (!comment) {
    return res.status(404).send("Comment not found");
  }
  return res.send(comment);
};
export const deleteComment = async (req: Request, res: Response) => {
  const commentId = req.params.id;
  const comment = await commentService.deleteComment(commentId);
  return res.send(comment);
};
