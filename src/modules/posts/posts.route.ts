import { Router, RequestHandler } from "express";
import {
  createPost,
  deletePost,
  fullyUpdatePost,
  getPostById,
  getPosts,
  partiallyUpdatePost,
  uploadPostPhoto,
} from "./posts.controller";
import { validationMiddleware } from "../../shared/middleware/validation.middleware";
import { fullyUpdatePostSchema } from "./schemas/fullyUpdatePost.schema";
import { createPostSchema } from "./schemas/createPost.schema";
import { idCheckingSchema } from "../../shared/helperSchemas/idChecking.schema";
import { resizeImage } from "../../shared/middleware/image-preprocessing.middleware";
import { s3Upload } from "../../shared/middleware/s3-image-upload.middleware";
import upload from "../../shared/middleware/multer.middleware";

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

router.post(
  "/upload",
  upload.single("photo"),
  resizeImage,
  s3Upload.single("photo"),
  uploadPostPhoto
);
export default router;
