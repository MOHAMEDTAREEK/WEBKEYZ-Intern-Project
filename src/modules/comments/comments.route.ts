import { Router } from "express";
import {
  createComment,
  deleteComment,
  fullyUpdateComment,
  getComments,
  partiallyUpdateComment,
} from "./comments.controller";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";
import { fullyUpdateCommentSchema } from "./schemas/fullyUpdateComment.schema";
import { partiallyUpdateCommentSchema } from "./schemas/partiallyUpdateComment.schema";

const router = Router();

router.get("/", getComments);
router.post("/", createComment);
router.put(
  "/:id",
  validationMiddleware(fullyUpdateCommentSchema),
  fullyUpdateComment
);
router.patch(
  "/:id",
  validationMiddleware(partiallyUpdateCommentSchema),
  partiallyUpdateComment
);
router.delete("/:id", deleteComment);

export default router;
