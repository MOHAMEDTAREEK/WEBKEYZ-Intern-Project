import { Router } from "express";
import {
  createPost,
  deletePost,
  fullyUpdatePost,
  getPostById,
  getPosts,
  partiallyUpdatePost,
} from "./posts.controller";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";
import { fullyUpdatePostSchema } from "./schemas/fullyUpdatePost.schema";
import { createPostSchema } from "./schemas/createPost.schema";
import { idCheckingSchema } from "../../shared/helperSchemas/idChecking.schema";

const router = Router();

router.get("/", getPosts);
router.get("/:id", validationMiddleware(idCheckingSchema), getPostById);
router.post("/", validationMiddleware(createPostSchema), createPost);
router.put(
  "/:id",
  validationMiddleware(fullyUpdatePostSchema),
  fullyUpdatePost
);
router.patch(
  "/:id",
  validationMiddleware(idCheckingSchema),
  partiallyUpdatePost
);
router.delete("/:id", validationMiddleware(idCheckingSchema), deletePost);

export default router;
